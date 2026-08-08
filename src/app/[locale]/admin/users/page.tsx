import { setRequestLocale, getTranslations } from "next-intl/server";
import { UserManagement } from "@/components/admin/UserManagement";

type Props = {
    params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "metadata" });
    return {
        title: t("adminUsers"),
    };
}

export default async function AdminUsersPage({ params }: Props) {
    const { locale } = await params;
    setRequestLocale(locale);

    return <UserManagement locale={locale} />;
}
