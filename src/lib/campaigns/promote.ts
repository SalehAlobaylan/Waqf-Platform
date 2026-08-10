import { prisma } from "@/lib/prisma";
import { ProjectLanguage, ProjectStatus, ApplicationStatus, CampaignStatus, ProjectCategory } from "@prisma/client";
import { notifyCampaignPromoted } from "@/lib/campaigns/notifications";
import { ensureUniqueProjectSlug, slugifyCampaign } from "@/lib/campaigns/slug";
import { DomainError } from "@/lib/campaigns/errors";

export interface PromoteResult {
    projectId: string;
    projectSlug: string;
    teamCount: number;
}

export async function promoteCampaignToProject(
    campaignId: string,
    ownerId: string
): Promise<PromoteResult> {
    const campaign = await prisma.campaign.findUnique({
        where: { id: campaignId },
        include: {
            roles: { include: { skill: true } },
            joins: { where: { status: "ACCEPTED" }, include: { contributor: true } },
        },
    });

    if (!campaign) {
        throw new DomainError("PROMOTE_CAMPAIGN_NOT_FOUND", "Campaign not found");
    }
    if (campaign.ownerId !== ownerId) {
        throw new DomainError("PROMOTE_NOT_OWNER", "Only the campaign owner can promote it");
    }
    if (campaign.status === "READY") {
        throw new DomainError("PROMOTE_ALREADY_PROMOTED", "Campaign is already promoted");
    }
    if (campaign.status !== "RECRUITING" && campaign.status !== "PENDING" && campaign.status !== "DRAFT") {
        throw new DomainError("PROMOTE_INVALID_STATUS", "Campaign cannot be promoted in its current state");
    }

    const requiredRoles = campaign.roles.filter((r) => r.isRequired);
    const unfilledRequired = requiredRoles.filter((r) => r.filledCount < r.count);
    if (unfilledRequired.length > 0) {
        throw new DomainError("PROMOTE_REQUIRED_ROLES", "Some required roles are not fully filled yet");
    }

    const baseSlug = slugifyCampaign(campaign.title);
    const projectSlug = await ensureUniqueProjectSlug(baseSlug);

    const acceptedJoins = campaign.joins;
    const byContributor = new Map(acceptedJoins.map((j) => [j.contributorId, j]));
    const uniqueJoins = Array.from(byContributor.values());

    const result = await prisma.$transaction(async (tx) => {
        const project = await tx.project.create({
            data: {
                title: campaign.title,
                slug: projectSlug,
                description: campaign.problem,
                impact: campaign.outcome ?? null,
                category: campaign.category as ProjectCategory,
                language: (campaign.language ?? "BOTH") as ProjectLanguage,
                country: campaign.country,
                status: ProjectStatus.DRAFT,
                ownerId: campaign.ownerId,
                organizationId: campaign.organizationId,
                tags: campaign.tags ?? [],
                skills: {
                    create: requiredRoles.map((r) => ({
                        skillId: r.skillId,
                        isRequired: true,
                    })),
                },
            },
        });

        if (uniqueJoins.length > 0) {
            await tx.application.createMany({
                data: uniqueJoins.map((j) => ({
                    projectId: project.id,
                    contributorId: j.contributorId,
                    status: ApplicationStatus.ACCEPTED,
                    message: j.message ?? null,
                    portfolioUrl: j.portfolioUrl ?? null,
                    hoursPerWeek: j.hoursPerWeek ?? null,
                })),
            });
        }

        const updated = await tx.campaign.update({
            where: { id: campaign.id },
            data: {
                status: CampaignStatus.READY,
                promotedProjectId: project.id,
            },
        });

        return { project, teamCount: uniqueJoins.length, campaign: updated };
    });

    for (const join of uniqueJoins) {
        try {
            // Best-effort: notification runs after the transaction commits.
            // If it fails, the user is still promoted — they just won't see
            // the in-app notification. See notifications.ts for details.
            await notifyCampaignPromoted({
                contributorId: join.contributorId,
                projectSlug: result.project.slug,
                campaignTitle: campaign.title,
            });
        } catch (err) {
            console.error("[campaigns/promote] notification failed", err);
        }
    }

    return {
        projectId: result.project.id,
        projectSlug: result.project.slug,
        teamCount: result.teamCount,
    };
}
