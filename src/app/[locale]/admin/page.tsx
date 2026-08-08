import { setRequestLocale, getTranslations } from "next-intl/server";
import { AdminDashboard } from "@/components/admin/AdminDashboard";

type Props = {
    params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "metadata" });
    return {
        title: t("admin"),
    };
}

export default async function AdminPage({ params }: Props) {
    const { locale } = await params;
    setRequestLocale(locale);

    return <AdminDashboard locale={locale} />;
}
