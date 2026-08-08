import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardCampaignJoinsClient } from "@/components/campaigns/DashboardCampaignJoinsClient";

interface Props {
    params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "metadata" });
    return { title: t("dashboardCampaignJoins") };
}

export default async function DashboardCampaignJoinsPage({ params }: Props) {
    const { locale } = await params;
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
        redirect(`/${locale}/login?redirect=/${locale}/dashboard/campaign-joins`);
    }

    const joins = await prisma.campaignJoin.findMany({
        where: { contributorId: session.user.id },
        include: {
            role: { select: { id: true, title: true, seniority: true } },
            campaign: {
                select: { id: true, slug: true, title: true, status: true, pitch: true },
            },
        },
        orderBy: { createdAt: "desc" },
    });

    return (
        <DashboardCampaignJoinsClient
            joins={joins.map((j) => ({
                id: j.id,
                status: j.status as "PENDING" | "ACCEPTED" | "REJECTED" | "WITHDRAWN",
                createdAt: j.createdAt.toISOString(),
                message: j.message,
                hoursPerWeek: j.hoursPerWeek,
                role: j.role,
                campaign: j.campaign,
            }))}
        />
    );
}
