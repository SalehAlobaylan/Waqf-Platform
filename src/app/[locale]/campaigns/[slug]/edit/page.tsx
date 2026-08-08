import { notFound, redirect } from "next/navigation";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { getTranslations } from "next-intl/server";
import { CampaignWizard } from "@/components/campaigns/wizard/CampaignWizard";

interface Props {
    params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({ params }: Props) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "metadata" });
    return { title: t("editCampaign") };
}

export default async function EditCampaignPage({ params }: Props) {
    const { locale, slug } = await params;
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user?.id) {
        redirect(`/${locale}/login?redirect=/${locale}/campaigns/${slug}/edit`);
    }

    const campaign = await prisma.campaign.findFirst({
        where: { OR: [{ slug }, { id: slug }] },
        include: {
            roles: { include: { skill: true } },
            milestones: true,
        },
    });
    if (!campaign) notFound();
    if (campaign.ownerId !== session.user.id) {
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { role: true },
        });
        if (user?.role !== "ADMIN") {
            redirect(`/${locale}/campaigns/${slug}`);
        }
    }

    const organizations = await prisma.organization.findMany({
        where: { userId: session.user.id },
        select: { id: true, name: true },
    });

    return (
        <CampaignWizard
            locale={locale}
            mode="edit"
            initialData={{
                id: campaign.id,
                title: campaign.title,
                pitch: campaign.pitch,
                problem: campaign.problem,
                outcome: campaign.outcome,
                category: campaign.category,
                language: campaign.language,
                country: campaign.country,
                contactEmail: campaign.contactEmail,
                organizationId: campaign.organizationId,
                recruitmentDeadline: campaign.recruitmentDeadline
                    ? campaign.recruitmentDeadline.toISOString()
                    : null,
                startsAt: campaign.startsAt ? campaign.startsAt.toISOString() : null,
                slug: campaign.slug,
                status: campaign.status,
                roles: campaign.roles.map((r) => ({
                    id: r.id,
                    skillId: r.skillId,
                    title: r.title,
                    description: r.description,
                    count: r.count,
                    seniority: r.seniority,
                    isRequired: r.isRequired,
                    skill: { name: r.skill.name },
                })),
                milestones: campaign.milestones.map((m) => ({
                    id: m.id,
                    title: m.title,
                    description: m.description,
                })),
            }}
            organizations={organizations}
        />
    );
}
