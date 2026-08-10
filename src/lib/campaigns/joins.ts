import { prisma } from "@/lib/prisma";
import { CampaignRoleStatus, CampaignJoinStatus } from "@prisma/client";
import { DomainError } from "@/lib/campaigns/errors";

export async function acceptJoin(joinId: string): Promise<void> {
    await prisma.$transaction(async (tx) => {
        const join = await tx.campaignJoin.findUnique({
            where: { id: joinId },
            include: { role: true },
        });
        if (!join) throw new DomainError("JOIN_NOT_FOUND", "Join not found");
        if (join.status !== "PENDING") {
            throw new DomainError("JOIN_NOT_PENDING", "Join has already been processed");
        }
        if (join.role.status === CampaignRoleStatus.CLOSED) {
            throw new DomainError("ROLE_CLOSED", "Role is closed");
        }
        if (join.role.filledCount >= join.role.count) {
            throw new DomainError("ROLE_FULL", "Role is already full");
        }

        await tx.campaignJoin.update({
            where: { id: joinId },
            data: { status: CampaignJoinStatus.ACCEPTED, decidedAt: new Date() },
        });

        const newFilled = join.role.filledCount + 1;
        const isFull = newFilled >= join.role.count;

        await tx.campaignRole.update({
            where: { id: join.role.id },
            data: {
                filledCount: newFilled,
                status: isFull ? CampaignRoleStatus.FILLED : join.role.status,
            },
        });
    });
}

export async function rejectJoin(joinId: string): Promise<void> {
    await prisma.campaignJoin.update({
        where: { id: joinId },
        data: { status: CampaignJoinStatus.REJECTED, decidedAt: new Date() },
    });
}

export async function withdrawJoin(joinId: string, contributorId: string): Promise<void> {
    await prisma.$transaction(async (tx) => {
        const join = await tx.campaignJoin.findUnique({
            where: { id: joinId },
            include: { role: true, campaign: { select: { status: true } } },
        });
        if (!join) throw new DomainError("JOIN_NOT_FOUND", "Join not found");
        if (join.contributorId !== contributorId) {
            throw new DomainError("JOIN_NOT_YOURS", "Not your join");
        }
        if (join.status !== "PENDING" && join.status !== "ACCEPTED") {
            throw new DomainError("JOIN_CANNOT_WITHDRAW", "Join cannot be withdrawn");
        }
        if (join.campaign.status !== "RECRUITING" && join.campaign.status !== "DRAFT") {
            throw new DomainError("CAMPAIGN_NOT_EDITABLE", "Campaign is no longer editable");
        }
        const wasAccepted = join.status === CampaignJoinStatus.ACCEPTED;
        await tx.campaignJoin.update({
            where: { id: joinId },
            data: { status: CampaignJoinStatus.WITHDRAWN, decidedAt: new Date() },
        });
        if (wasAccepted && join.role.filledCount > 0) {
            await tx.campaignRole.update({
                where: { id: join.role.id },
                data: {
                    filledCount: join.role.filledCount - 1,
                    status:
                        join.role.status === CampaignRoleStatus.FILLED
                            ? CampaignRoleStatus.OPEN
                            : join.role.status,
                },
            });
        }
    });
}
