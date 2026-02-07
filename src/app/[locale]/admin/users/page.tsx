import { setRequestLocale } from "next-intl/server";
import { UserManagement } from "@/components/admin/UserManagement";

type Props = {
    params: Promise<{ locale: string }>;
};

export default async function AdminUsersPage({ params }: Props) {
    const { locale } = await params;
    setRequestLocale(locale);

    return <UserManagement locale={locale} />;
}
