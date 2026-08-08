import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { getTranslations } from "next-intl/server";
import { CampaignWizard } from "@/components/campaigns/wizard/CampaignWizard";

interface Props {
    params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "metadata" });
    return { title: t("newCampaign") };
}

export default async function NewCampaignPage({ params }: Props) {
    const { locale } = await params;
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user?.id) {
        redirect(`/${locale}/login?redirect=/${locale}/campaigns/new`);
    }

    const organizations = await prisma.organization.findMany({
        where: { userId: session.user.id },
        select: { id: true, name: true },
    });

    return (
        <CampaignWizard
            locale={locale}
            mode="create"
            organizations={organizations}
        />
    );
}
