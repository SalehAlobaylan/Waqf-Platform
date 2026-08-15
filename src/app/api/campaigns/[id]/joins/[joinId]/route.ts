import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuthOrThrow } from "@/lib/auth-helpers";
import { withApiHandler, ApiHandlerContext } from "@/lib/api/handler";
import { campaignJoinUpdateSchema, idSchema, routeIdParamSchema } from "@/lib/validation/schemas";
import { parseBody, parseParams } from "@/lib/validation/parse";
import { makeNotFoundError, makeValidationError } from "@/lib/validation/errors";
import { acceptJoin, rejectJoin, withdrawJoin } from "@/lib/campaigns/joins";
import { notifyContributorJoinDecision } from "@/lib/campaigns/notifications";
import { DomainError } from "@/lib/campaigns/errors";
import { log } from "@/lib/logger";
import { checkRateLimit, rateLimitedResponse } from "@/lib/rate-limit";

interface RouteParams {
    params: Promise<{ id: string; joinId: string }>;
}

/**
 * Maps campaign-join domain rules to 4xx responses. Returns null when the
 * error is not a known domain rule so real failures (DB down, etc.) fall
 * through to the centralized 500 handler instead of being mislabeled 400.
 */
function mapJoinDomainError(error: unknown): NextResponse | null {
    if (error instanceof DomainError) {
        switch (error.code) {
            case "JOIN_NOT_FOUND":
                return NextResponse.json(makeNotFoundError(error.message, "joinId"), { status: 404 });
            case "JOIN_NOT_YOURS":
                return NextResponse.json({ error: "Forbidden", code: "FORBIDDEN" }, { status: 403 });
            default:
                return NextResponse.json(
                    makeValidationError(error.message, "status"),
                    { status: 400 }
                );
        }
    }
    return null;
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
    const ctx: ApiHandlerContext = {};
    return withApiHandler(request, "api.campaigns.joins.update", async () => {
        const user = await requireAuthOrThrow();
        ctx.userId = user.id;

        const rate = checkRateLimit(request, "campaign-join-decision", { limit: 30, windowMs: 60_000 }, user.id);
        if (!rate.allowed) {
            return rateLimitedResponse(rate);
        }

        const parsedParams = parseParams(await params, routeIdParamSchema.extend({ joinId: idSchema }));
        if (!parsedParams.success) {
            return NextResponse.json(parsedParams.error, { status: 400 });
        }
        const parsedBody = await parseBody(request, campaignJoinUpdateSchema);
        if (!parsedBody.success) {
            return NextResponse.json(parsedBody.error, { status: 400 });
        }
        const { id, joinId } = parsedParams.data;
        const { status } = parsedBody.data;

        const join = await prisma.campaignJoin.findUnique({
            where: { id: joinId },
            include: {
                campaign: { select: { id: true, slug: true, title: true, ownerId: true, status: true } },
                role: { select: { title: true } },
                contributor: { select: { id: true, name: true } },
            },
        });
        if (!join || join.campaignId !== id) {
            return NextResponse.json(makeNotFoundError("Join not found", "joinId"), { status: 404 });
        }

        const adminUser = await prisma.user.findUnique({
            where: { id: user.id },
            select: { role: true },
        });
        const isAdmin = adminUser?.role === "ADMIN";
        const isOwner = join.campaign.ownerId === user.id;
        const isSelf = join.contributorId === user.id;

        if (status === "WITHDRAWN") {
            if (!isSelf) {
                return NextResponse.json({ error: "Forbidden", code: "FORBIDDEN" }, { status: 403 });
            }
            try {
                await withdrawJoin(joinId, user.id);
            } catch (err) {
                const mapped = mapJoinDomainError(err);
                if (mapped) return mapped;
                throw err;
            }
            const updated = await prisma.campaignJoin.findUnique({
                where: { id: joinId },
                include: { role: { include: { skill: true } } },
            });
            return NextResponse.json(updated);
        }

        if (!isOwner && !isAdmin) {
            return NextResponse.json({ error: "Forbidden", code: "FORBIDDEN" }, { status: 403 });
        }

        try {
            if (status === "ACCEPTED") {
                await acceptJoin(joinId);
            } else if (status === "REJECTED") {
                await rejectJoin(joinId);
            }
        } catch (err) {
            const mapped = mapJoinDomainError(err);
            if (mapped) return mapped;
            throw err;
        }

        try {
            await notifyContributorJoinDecision({
                contributorId: join.contributorId,
                accepted: status === "ACCEPTED",
                campaignSlug: join.campaign.slug,
                campaignTitle: join.campaign.title,
                roleTitle: join.role.title,
            });
        } catch (err) {
            log.warn("api.campaigns.joinDecision.notify", "decision notification failed", undefined, err);
        }

        const updated = await prisma.campaignJoin.findUnique({
            where: { id: joinId },
            include: { role: { include: { skill: true } } },
        });
        return NextResponse.json(updated);
    }, ctx);
}
