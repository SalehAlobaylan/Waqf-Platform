import { setRequestLocale, getTranslations } from "next-intl/server";
import { CampaignReviewCard } from "@/components/admin/CampaignReviewCard";

type Props = {
    params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "metadata" });
    return { title: t("adminCampaigns") };
}

export default async function AdminCampaignsPage({ params }: Props) {
    const { locale } = await params;
    setRequestLocale(locale);
    return <CampaignReviewCard locale={locale} />;
}
