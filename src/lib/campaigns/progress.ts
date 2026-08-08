import { prisma } from "@/lib/prisma";
import { CampaignStatus } from "@prisma/client";

export interface CampaignProgress {
    totalRoles: number;
    filledRoles: number;
    requiredRoles: number;
    filledRequiredRoles: number;
    totalSeats: number;
    filledSeats: number;
    totalMilestones: number;
    doneMilestones: number;
    overallPercent: number;
    isReadyEligible: boolean;
}

export async function getCampaignProgress(campaignId: string): Promise<CampaignProgress> {
    const [roles, milestones] = await Promise.all([
        prisma.campaignRole.findMany({
            where: { campaignId },
            select: { count: true, filledCount: true, isRequired: true },
        }),
        prisma.campaignMilestone.findMany({
            where: { campaignId },
            select: { isDone: true },
        }),
    ]);

    const totalRoles = roles.length;
    const filledRoles = roles.filter((r) => r.filledCount >= r.count && r.count > 0).length;
    const requiredRoles = roles.filter((r) => r.isRequired).length;
    const filledRequiredRoles = roles.filter((r) => r.isRequired && r.filledCount >= r.count && r.count > 0).length;
    const totalSeats = roles.reduce((sum, r) => sum + r.count, 0);
    const filledSeats = roles.reduce((sum, r) => sum + Math.min(r.filledCount, r.count), 0);
    const totalMilestones = milestones.length;
    const doneMilestones = milestones.filter((m) => m.isDone).length;

    const rolesPct = totalSeats > 0 ? (filledSeats / totalSeats) * 100 : 0;
    const milestonesPct = totalMilestones > 0 ? (doneMilestones / totalMilestones) * 100 : 0;

    const rolesWeight = totalSeats > 0 ? 0.6 : 0;
    const milestonesWeight = totalMilestones > 0 ? 0.4 : 0;
    const totalWeight = rolesWeight + milestonesWeight || 1;

    const overallPercent = Math.round(
        (rolesPct * rolesWeight + milestonesPct * milestonesWeight) / totalWeight
    );

    const isReadyEligible = requiredRoles > 0 && filledRequiredRoles === requiredRoles;

    return {
        totalRoles,
        filledRoles,
        requiredRoles,
        filledRequiredRoles,
        totalSeats,
        filledSeats,
        totalMilestones,
        doneMilestones,
        overallPercent,
        isReadyEligible,
    };
}

export async function getCampaignStatus(campaignId: string): Promise<CampaignStatus | null> {
    const campaign = await prisma.campaign.findUnique({
        where: { id: campaignId },
        select: { status: true },
    });
    return campaign?.status ?? null;
}
