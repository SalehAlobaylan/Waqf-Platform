import { prisma } from "@/lib/prisma";

/**
 * Notification helpers.
 *
 * IMPORTANT: These run *outside* the surrounding prisma.$transaction. If the
 * DB write commits and the notification then fails, the user is left
 * uninformed. Callers should either:
 *   1. Wrap the call in try/catch and log (current convention), or
 *   2. Move notifications into a queue (TODO when queue infra exists).
 *
 * The current behavior is acceptable because the affected user can still
 * see the state change in the dashboard — the notification is best-effort.
 */

export async function notifyCampaignOwnerOfJoin(params: {
    ownerId: string;
    contributorName: string;
    campaignSlug: string;
    roleTitle: string;
}) {
    await prisma.notification.create({
        data: {
            userId: params.ownerId,
            type: "CAMPAIGN_JOIN",
            title: "New campaign join",
            content: `${params.contributorName} wants to join as ${params.roleTitle}`,
            link: `/dashboard/campaigns`,
        },
    });
}

export async function notifyContributorJoinDecision(params: {
    contributorId: string;
    accepted: boolean;
    campaignSlug: string;
    campaignTitle: string;
    roleTitle: string;
}) {
    await prisma.notification.create({
        data: {
            userId: params.contributorId,
            type: "CAMPAIGN_JOIN_DECISION",
            title: params.accepted ? "You've been accepted" : "Application update",
            content: params.accepted
                ? `You are confirmed for ${params.roleTitle} on "${params.campaignTitle}"`
                : `Your application for ${params.roleTitle} on "${params.campaignTitle}" was declined`,
            link: `/dashboard/campaign-joins`,
        },
    });
}

export async function notifyCampaignAdminAction(params: {
    ownerId: string;
    approved: boolean;
    campaignSlug: string;
    campaignTitle: string;
    feedback?: string | null;
}) {
    await prisma.notification.create({
        data: {
            userId: params.ownerId,
            type: "CAMPAIGN_REVIEW",
            title: params.approved ? "Your campaign is live" : "Your campaign needs changes",
            content: params.approved
                ? `"${params.campaignTitle}" is now recruiting`
                : params.feedback
                    ? `Admin feedback: ${params.feedback}`
                    : `"${params.campaignTitle}" was sent back for changes`,
            link: `/campaigns/${params.campaignSlug}`,
        },
    });
}

export async function notifyCampaignPromoted(params: {
    contributorId: string;
    projectSlug: string;
    campaignTitle: string;
}) {
    await prisma.notification.create({
        data: {
            userId: params.contributorId,
            type: "CAMPAIGN_PROMOTED",
            title: "Your team is complete",
            content: `Campaign "${params.campaignTitle}" promoted to a project. You are confirmed on the team.`,
            link: `/projects/${params.projectSlug}`,
        },
    });
}
