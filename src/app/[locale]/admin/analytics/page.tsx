import { setRequestLocale } from "next-intl/server";
import { AnalyticsDashboard } from "@/components/admin/AnalyticsDashboard";

type Props = {
    params: Promise<{ locale: string }>;
};

export default async function AdminAnalyticsPage({ params }: Props) {
    const { locale } = await params;
    setRequestLocale(locale);

    return <AnalyticsDashboard locale={locale} />;
}
