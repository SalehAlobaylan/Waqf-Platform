import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { GeneralSettings } from "@/components/settings/GeneralSettings";

export const metadata = {
    title: "General Settings | Waqf",
};

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
