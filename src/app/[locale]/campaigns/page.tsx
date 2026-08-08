import { prisma } from "@/lib/prisma";
import { CampaignStatus, Prisma } from "@prisma/client";
import { getTranslations } from "next-intl/server";
import { CampaignsListClient } from "@/components/campaigns/CampaignsListClient";

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "metadata" });
    return { title: t("campaigns") };
}

const PAGE_SIZE = 24;

export default async function CampaignsPage() {
    const where: Prisma.CampaignWhereInput = { status: CampaignStatus.RECRUITING };

    const [campaigns, total] = await Promise.all([
        prisma.campaign.findMany({
            where,
            include: {
                owner: { select: { id: true, name: true, image: true } },
                organization: { select: { id: true, name: true, logo: true } },
                roles: { include: { skill: true } },
                _count: { select: { joins: true } },
            },
            orderBy: { createdAt: "desc" },
            take: PAGE_SIZE,
        }),
        prisma.campaign.count({ where }),
    ]);

    return (
        <CampaignsListClient
            initialCampaigns={campaigns}
            total={total}
            pageSize={PAGE_SIZE}
        />
    );
}
