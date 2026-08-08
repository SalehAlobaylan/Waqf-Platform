import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { OnboardingFlow } from "@/components/auth/OnboardingFlow";
import { prisma } from "@/lib/prisma";

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "metadata" });
    return {
        title: t("onboarding"),
    };
}

export default async function OnboardingPage({
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

    const hasContributorProfile = await prisma.contributorProfile.findUnique({
        where: { userId: session.user.id },
    });

    const hasOrganization = await prisma.organization.findFirst({
        where: { userId: session.user.id },
    });

    if (hasContributorProfile || hasOrganization) {
        redirect(`/${locale}/explore`);
    }

    return (
        <div className="min-h-screen bg-secondary-50 flex items-center justify-center p-4">
            <div className="w-full max-w-4xl">
                <OnboardingFlow locale={locale} userName={session.user.name} />
            </div>
        </div>
    );
}
