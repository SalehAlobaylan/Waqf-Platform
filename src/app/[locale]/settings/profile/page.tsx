import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { EditProfileForm } from "@/components/profile/EditProfileForm";

export const metadata = {
    title: "Edit Profile | Waqf",
};

export default async function SettingsProfilePage({
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

    const profile = await prisma.contributorProfile.findUnique({
        where: { userId: session.user.id },
        include: {
            skills: true,
            portfolioItems: { orderBy: { order: "asc" } }
        }
    });

    if (!profile) {
        // They haven't created a contributor profile (might be mutawalli). Render basic error or message.
        return (
            <div className="p-8 text-center text-secondary-500">
                {locale === "ar"
                    ? "ملف المساهم غير موجود. يرجى التبديل لنمط المساهم."
                    : "Contributor profile not found. Please create one to edit."}
            </div>
        );
    }

    const { skills, portfolioItems, ...mainProfile } = profile;
    const transformedSkills = skills.map(sk => ({ skillId: sk.skillId, level: sk.level, yearsExperience: sk.yearsExperience }));

    return (
        <EditProfileForm
            initialProfile={mainProfile as any}
            initialSkills={transformedSkills}
            initialPortfolio={portfolioItems as any}
            locale={locale}
        />
    );
}
