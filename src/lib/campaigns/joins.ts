import { prisma } from "@/lib/prisma";
import { CampaignRoleStatus, CampaignJoinStatus } from "@prisma/client";

export async function acceptJoin(joinId: string): Promise<void> {
    await prisma.$transaction(async (tx) => {
        const join = await tx.campaignJoin.findUnique({
            where: { id: joinId },
            include: { role: true },
        });
        if (!join) throw new Error("Join not found");
        if (join.status !== "PENDING") {
            throw new Error(`Join is in status ${join.status}`);
        }
        if (join.role.status === CampaignRoleStatus.CLOSED) {
            throw new Error("Role is closed");
        }
        if (join.role.filledCount >= join.role.count) {
            throw new Error("Role is already full");
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
        if (!join) throw new Error("Join not found");
        if (join.contributorId !== contributorId) {
            throw new Error("Not your join");
        }
        if (join.status !== "PENDING" && join.status !== "ACCEPTED") {
            throw new Error("Join cannot be withdrawn");
        }
        if (join.campaign.status !== "RECRUITING" && join.campaign.status !== "DRAFT") {
            throw new Error("Campaign is no longer editable");
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
