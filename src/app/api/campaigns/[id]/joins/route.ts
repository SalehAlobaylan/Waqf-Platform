import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuthOrThrow, isOwnerOrAdmin } from "@/lib/auth-helpers";
import { withApiHandler, ApiHandlerContext } from "@/lib/api/handler";
import { campaignJoinCreateSchema, routeIdParamSchema } from "@/lib/validation/schemas";
import { parseBody, parseParams } from "@/lib/validation/parse";
import { makeNotFoundError, makeValidationError } from "@/lib/validation/errors";
import { canJoinCampaign } from "@/lib/campaigns/permissions";
import { notifyCampaignOwnerOfJoin } from "@/lib/campaigns/notifications";
import { checkRateLimit, rateLimitedResponse } from "@/lib/rate-limit";
import { CampaignJoinStatus, CampaignRoleStatus } from "@prisma/client";
import { log } from "@/lib/logger";

interface RouteParams {
    params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
    const ctx: ApiHandlerContext = {};
    return withApiHandler(request, "api.campaigns.joins.list", async () => {
        const user = await requireAuthOrThrow();
        ctx.userId = user.id;

        const parsedParams = parseParams(await params, routeIdParamSchema);
        if (!parsedParams.success) {
            return NextResponse.json(parsedParams.error, { status: 400 });
        }
        const { id } = parsedParams.data;

        const campaign = await prisma.campaign.findUnique({
            where: { id },
            select: { ownerId: true },
        });
        if (!campaign) {
            return NextResponse.json(makeNotFoundError("Campaign not found", "id"), { status: 404 });
        }
        if (!(await isOwnerOrAdmin(user.id, campaign.ownerId))) {
            return NextResponse.json({ error: "Forbidden", code: "FORBIDDEN" }, { status: 403 });
        }

        const joins = await prisma.campaignJoin.findMany({
            where: { campaignId: id },
            include: {
                role: { include: { skill: true } },
                contributor: { select: { id: true, name: true, username: true, image: true } },
            },
            orderBy: [{ status: "asc" }, { createdAt: "desc" }],
            // Bounded page: owner review lists render summaries, not archives
            take: 200,
        });
        return NextResponse.json({ joins });
    }, ctx);
}

export async function POST(request: NextRequest, { params }: RouteParams) {
    const ctx: ApiHandlerContext = {};
    return withApiHandler(request, "api.campaigns.joins.create", async () => {
        const user = await requireAuthOrThrow();
        ctx.userId = user.id;

        const rate = checkRateLimit(request, "campaign-join", { limit: 10, windowMs: 60_000 }, user.id);
        if (!rate.allowed) {
            return rateLimitedResponse(rate);
        }
        const parsedParams = parseParams(await params, routeIdParamSchema);
        if (!parsedParams.success) {
            return NextResponse.json(parsedParams.error, { status: 400 });
        }
        const parsedBody = await parseBody(request, campaignJoinCreateSchema);
        if (!parsedBody.success) {
            return NextResponse.json(parsedBody.error, { status: 400 });
        }
        const { id } = parsedParams.data;
        const { roleId, message, portfolioUrl, hoursPerWeek } = parsedBody.data;

        const access = await canJoinCampaign(id, {
            userId: user.id,
            isAdmin: false,
        });
        if (!access.ok) {
            return NextResponse.json(
                makeValidationError(access.reason || "Cannot join", "id"),
                { status: 400 }
            );
        }

        const role = await prisma.campaignRole.findUnique({
            where: { id: roleId },
            include: { campaign: { select: { id: true, slug: true, title: true, status: true } } },
        });
        if (!role || role.campaignId !== id) {
            return NextResponse.json(makeNotFoundError("Role not found", "roleId"), { status: 404 });
        }
        if (role.status === CampaignRoleStatus.CLOSED) {
            return NextResponse.json(
                makeValidationError("Role is closed", "roleId"),
                { status: 400 }
            );
        }
        if (role.status === CampaignRoleStatus.FILLED || role.filledCount >= role.count) {
            return NextResponse.json(
                makeValidationError("Role is already full", "roleId"),
                { status: 400 }
            );
        }

        const existing = await prisma.campaignJoin.findUnique({
            where: { campaignRoleId_contributorId: { campaignRoleId: roleId, contributorId: user.id } },
        });
        if (existing) {
            return NextResponse.json(
                makeValidationError("You have already applied to this role", "roleId"),
                { status: 400 }
            );
        }

        const join = await prisma.campaignJoin.create({
            data: {
                campaignId: id,
                campaignRoleId: roleId,
                contributorId: user.id,
                message: message ?? null,
                portfolioUrl: portfolioUrl ?? null,
                hoursPerWeek: hoursPerWeek ?? null,
                status: CampaignJoinStatus.PENDING,
            },
            include: {
                role: { include: { skill: true } },
                campaign: { select: { id: true, slug: true, title: true } },
            },
        });

        try {
            await notifyCampaignOwnerOfJoin({
                ownerId: access.campaign!.ownerId,
                contributorName: user.name,
                campaignSlug: role.campaign.slug,
                roleTitle: role.title,
            });
        } catch (err) {
            log.warn("api.campaigns.join.create", "owner notification failed", undefined, err);
        }

        return NextResponse.json(join, { status: 201 });
    }, ctx);
}
