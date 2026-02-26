import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { OnboardingFlow } from "@/components/auth/OnboardingFlow";
import { prisma } from "@/lib/prisma";

export const metadata = {
    title: "Welcome to Waqf | Choose Your Path",
    description: "Complete your profile setup to get started",
};

export default async function OnboardingPage({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;

    // Server-side auth check
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session || !session.user) {
        redirect(`/${locale}/login`);
    }

    // Check if user already has a contributor profile or an organization
    const hasContributorProfile = await prisma.contributorProfile.findUnique({
        where: { userId: session.user.id },
    });

    const hasOrganization = await prisma.organization.findFirst({
        where: { userId: session.user.id },
    });

    if (hasContributorProfile || hasOrganization) {
        // They already picked a path, send them to dashboard
        redirect(`/${locale}/explore`);
    }

    return (
        <div className="min-h-screen bg-secondary-50 flex items-center justify-center p-4">
            <div className="w-full max-w-4xl">
                <OnboardingFlow locale={locale} userId={session.user.id} userName={session.user.name} />
            </div>
        </div>
    );
}
