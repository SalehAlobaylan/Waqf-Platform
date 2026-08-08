import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardCampaignsClient } from "@/components/campaigns/DashboardCampaignsClient";

interface Props {
    params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "metadata" });
    return { title: t("dashboardCampaigns") };
}

export default async function DashboardCampaignsPage({ params }: Props) {
    const { locale } = await params;
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
        redirect(`/${locale}/login?redirect=/${locale}/dashboard/campaigns`);
    }

    const campaigns = await prisma.campaign.findMany({
        where: { ownerId: session.user.id },
        select: {
            id: true,
            slug: true,
            title: true,
            pitch: true,
            status: true,
            roles: { select: { id: true, count: true, filledCount: true } },
            _count: { select: { joins: true } },
        },
        orderBy: { updatedAt: "desc" },
    });

    const joinsByCampaign: Record<
        string,
        Array<{
            id: string;
            status: string;
            message: string | null;
            portfolioUrl: string | null;
            hoursPerWeek: number | null;
            contributor: { id: string; name: string; username: string | null; image: string | null };
            role: { id: string; title: string };
        }>
    > = {};

    if (campaigns.length > 0) {
        const joins = await prisma.campaignJoin.findMany({
            where: { campaignId: { in: campaigns.map((c) => c.id) } },
            include: {
                contributor: { select: { id: true, name: true, username: true, image: true } },
                role: { select: { id: true, title: true, campaignId: true } },
            },
            orderBy: { createdAt: "desc" },
        });
        for (const j of joins) {
            const cid = j.role.campaignId;
            if (!joinsByCampaign[cid]) joinsByCampaign[cid] = [];
            joinsByCampaign[cid].push({
                id: j.id,
                status: j.status,
                message: j.message,
                portfolioUrl: j.portfolioUrl,
                hoursPerWeek: j.hoursPerWeek,
                contributor: j.contributor,
                role: { id: j.role.id, title: j.role.title },
            });
        }
    }

    return (
        <DashboardCampaignsClient
            campaigns={campaigns.map((c) => ({
                id: c.id,
                slug: c.slug,
                title: c.title,
                pitch: c.pitch,
                status: c.status,
                roles: c.roles,
                _count: c._count,
            }))}
            joinsByCampaign={joinsByCampaign}
        />
    );
}
