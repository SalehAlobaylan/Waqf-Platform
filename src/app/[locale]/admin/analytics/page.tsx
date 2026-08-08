import { setRequestLocale, getTranslations } from "next-intl/server";
import { AnalyticsDashboard } from "@/components/admin/AnalyticsDashboard";

type Props = {
    params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "metadata" });
    return {
        title: t("adminAnalytics"),
    };
}

export default async function AdminAnalyticsPage({ params }: Props) {
    const { locale } = await params;
    setRequestLocale(locale);

    return <AnalyticsDashboard locale={locale} />;
}
