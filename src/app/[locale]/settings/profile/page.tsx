import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { EditProfileForm } from "@/components/profile/EditProfileForm";
import { GitHubCard } from "@/components/profile/GitHubCard";
import { parseGithubData } from "@/lib/github";
import type { ContributorProfile, ContributorSkill, PortfolioItem } from "@prisma/client";

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "metadata" });
    return {
        title: t("settingsProfile"),
    };
}

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

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { username: true, id: true },
    });
    const userHandle = user?.username ?? user?.id ?? session.user.id;

    return (
        <div>
            <EditProfileForm
                initialProfile={mainProfile as ContributorProfile}
                initialSkills={transformedSkills as ContributorSkill[]}
                initialPortfolio={portfolioItems as PortfolioItem[]}
                locale={locale}
                userHandle={userHandle}
            />
            <div className="mt-4 bg-white rounded-2xl border border-waqf-border p-6">
                <GitHubCard
                    initialUsername={profile.githubUsername}
                    initialData={parseGithubData(profile.githubData)}
                />
            </div>
        </div>
    );
}
