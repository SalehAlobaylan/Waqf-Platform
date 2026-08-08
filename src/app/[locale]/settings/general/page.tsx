import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { GeneralSettings } from "@/components/settings/GeneralSettings";

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "metadata" });
    return {
        title: t("settingsGeneral"),
    };
}

export default async function SettingsGeneralPage({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session || !session.user) {
        redirect(`/${locale}/login`);
    }

    return (
        <GeneralSettings
            userEmail={session.user.email}
            currentLanguage={locale}
        />
    );
}
