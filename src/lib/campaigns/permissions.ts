import { prisma } from "@/lib/prisma";

export interface CampaignAccessContext {
    userId: string;
    isAdmin: boolean;
}

export async function getCampaignForView(idOrSlug: string) {
    return prisma.campaign.findFirst({
        where: {
            OR: [{ id: idOrSlug }, { slug: idOrSlug }],
        },
        include: {
            owner: { select: { id: true, name: true, username: true, image: true } },
            organization: { select: { id: true, name: true, logo: true, verified: true } },
            roles: {
                include: { skill: true },
                orderBy: { createdAt: "asc" },
            },
            milestones: { orderBy: { order: "asc" } },
            promotedProject: { select: { id: true, slug: true, title: true, status: true } },
        },
    });
}

export async function canEditCampaign(campaignId: string, ctx: CampaignAccessContext) {
    if (ctx.isAdmin) return true;
    const campaign = await prisma.campaign.findUnique({
        where: { id: campaignId },
        select: { ownerId: true },
    });
    if (!campaign) return false;
    return campaign.ownerId === ctx.userId;
}

export async function canManageJoins(campaignId: string, ctx: CampaignAccessContext) {
    return canEditCampaign(campaignId, ctx);
}

export async function canJoinCampaign(
    campaignId: string,
    ctx: CampaignAccessContext
): Promise<{ ok: boolean; reason?: string; campaign?: { ownerId: string; status: string } }> {
    const campaign = await prisma.campaign.findUnique({
        where: { id: campaignId },
        select: { ownerId: true, status: true },
    });
    if (!campaign) return { ok: false, reason: "Campaign not found" };
    if (campaign.ownerId === ctx.userId) {
        return { ok: false, reason: "You cannot join your own campaign", campaign };
    }
    if (campaign.status !== "RECRUITING") {
        return { ok: false, reason: "Campaign is not recruiting", campaign };
    }
    return { ok: true, campaign };
}
