import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { campaignJoinCreateSchema, routeIdParamSchema } from "@/lib/validation/schemas";
import { parseBody, parseParams } from "@/lib/validation/parse";
import { makeValidationError } from "@/lib/validation/errors";
import { canJoinCampaign } from "@/lib/campaigns/permissions";
import { notifyCampaignOwnerOfJoin } from "@/lib/campaigns/notifications";
import { checkRateLimit, rateLimitedResponse } from "@/lib/rate-limit";
import { CampaignJoinStatus, CampaignRoleStatus } from "@prisma/client";

interface RouteParams {
    params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Authentication required" }, { status: 401 });
        }
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
            return NextResponse.json(
                makeValidationError("Campaign not found", "id"),
                { status: 404 }
            );
        }
        if (campaign.ownerId !== session.user.id) {
            const user = await prisma.user.findUnique({
                where: { id: session.user.id },
                select: { role: true },
            });
            if (user?.role !== "ADMIN") {
                return NextResponse.json({ error: "Not authorized" }, { status: 403 });
            }
        }

        const joins = await prisma.campaignJoin.findMany({
            where: { campaignId: id },
            include: {
                role: { include: { skill: true } },
                contributor: { select: { id: true, name: true, username: true, image: true } },
            },
            orderBy: [{ status: "asc" }, { createdAt: "desc" }],
        });
        return NextResponse.json({ joins });
    } catch (error) {
        console.error("[API] Error fetching campaign joins:", error);
        return NextResponse.json({ error: "Failed to fetch joins" }, { status: 500 });
    }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Authentication required" }, { status: 401 });
        }
        if (!checkRateLimit(request, "campaign-join", { limit: 10, windowMs: 60_000 }, session.user.id)) {
            return rateLimitedResponse();
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
            userId: session.user.id,
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
            return NextResponse.json(
                makeValidationError("Role not found", "roleId"),
                { status: 404 }
            );
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
            where: { campaignRoleId_contributorId: { campaignRoleId: roleId, contributorId: session.user.id } },
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
                contributorId: session.user.id,
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
                contributorName: session.user.name,
                campaignSlug: role.campaign.slug,
                roleTitle: role.title,
            });
        } catch (err) {
            console.error("[campaigns/joins] owner notification failed", err);
        }

        return NextResponse.json(join, { status: 201 });
    } catch (error) {
        console.error("[API] Error creating campaign join:", error);
        return NextResponse.json({ error: "Failed to submit join" }, { status: 500 });
    }
}
