import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { adminCampaignActionSchema, routeIdParamSchema } from "@/lib/validation/schemas";
import { parseBody, parseParams } from "@/lib/validation/parse";
import { CampaignStatus } from "@prisma/client";
import { notifyCampaignAdminAction } from "@/lib/campaigns/notifications";

interface RouteParams {
    params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { role: true },
        });
        if (user?.role !== "ADMIN") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

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
            return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
        }
        if (campaign.status !== CampaignStatus.PENDING) {
            return NextResponse.json({ error: "Campaign is not pending review" }, { status: 400 });
        }

        const updated = await prisma.campaign.update({
            where: { id },
            data: {
                status: CampaignStatus.RECRUITING,
                adminFeedback: feedback ?? null,
            },
        });

        try {
            await notifyCampaignAdminAction({
                ownerId: campaign.ownerId,
                approved: true,
                campaignSlug: campaign.slug,
                campaignTitle: campaign.title,
                feedback: feedback ?? null,
            });
        } catch (err) {
            console.error("[admin/campaigns/approve] notify failed", err);
        }

        return NextResponse.json(updated);
    } catch (error) {
        console.error("[API] Admin approve campaign error:", error);
        return NextResponse.json({ error: "Failed to approve campaign" }, { status: 500 });
    }
}
