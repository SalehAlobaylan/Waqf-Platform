import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminOrThrow } from "@/lib/auth-helpers";
import { withApiHandler, ApiHandlerContext } from "@/lib/api/handler";
import { adminCampaignActionSchema, routeIdParamSchema } from "@/lib/validation/schemas";
import { parseBody, parseParams } from "@/lib/validation/parse";
import { makeNotFoundError, makeValidationError } from "@/lib/validation/errors";
import { CampaignStatus } from "@prisma/client";
import { notifyCampaignAdminAction } from "@/lib/campaigns/notifications";
import { log } from "@/lib/logger";

interface RouteParams {
    params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
    const ctx: ApiHandlerContext = {};
    return withApiHandler(request, "api.admin.campaigns.reject", async () => {
        const admin = await requireAdminOrThrow();
        ctx.userId = admin.id;

        const parsedParams = parseParams(await params, routeIdParamSchema);
        if (!parsedParams.success) {
            return NextResponse.json(parsedParams.error, { status: 400 });
        }
        const parsedBody = await parseBody(request, adminCampaignActionSchema);
        if (!parsedBody.success) {
            return NextResponse.json(parsedBody.error, { status: 400 });
        }

        const { id } = parsedParams.data;
        const { feedback } = parsedBody.data;

        const campaign = await prisma.campaign.findUnique({
            where: { id },
            select: { status: true, ownerId: true, title: true, slug: true },
        });
        if (!campaign) {
            return NextResponse.json(makeNotFoundError("Campaign not found", "id"), { status: 404 });
        }
        if (campaign.status !== CampaignStatus.PENDING) {
            return NextResponse.json(
                makeValidationError("Campaign is not pending review", "status"),
                { status: 400 }
            );
        }

        const updated = await prisma.campaign.update({
            where: { id },
            data: {
                status: CampaignStatus.DRAFT,
                adminFeedback: feedback ?? null,
            },
        });

        try {
            await notifyCampaignAdminAction({
                ownerId: campaign.ownerId,
                approved: false,
                campaignSlug: campaign.slug,
                campaignTitle: campaign.title,
                feedback: feedback ?? null,
            });
        } catch (err) {
            log.warn("api.admin.campaigns.reject", "notify failed", undefined, err);
        }

        return NextResponse.json(updated);
    }, ctx);
}
