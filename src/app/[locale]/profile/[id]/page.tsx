// Added PortfolioGrid to imports (wait, need to actually replace the whole file from start)
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { SkillsMatrix } from "@/components/profile/SkillsMatrix";
import { ContributionHeatmap } from "@/components/profile/ContributionHeatmap";
import { WaqfTimeline } from "@/components/profile/WaqfTimeline";
import { PortfolioGrid } from "@/components/profile/PortfolioGrid";
import { Heart, GitPullRequest, FolderOpen } from "lucide-react";

interface ProfilePageProps {
    params: Promise<{ locale: string; id: string }>;
}

export async function generateMetadata({ params }: ProfilePageProps) {
    const { id } = await params;
    const user = await prisma.user.findUnique({
        where: { id },
        select: { name: true },
    });

    return {
        title: user ? `${user.name} | Waqf` : "Profile | Waqf",
        description: user ? `View ${user.name}'s contributor profile on Waqf` : "Contributor profile",
    };
}

export default async function ProfilePage({ params }: ProfilePageProps) {
    const { locale, id } = await params;
    const session = await auth.api.getSession({ headers: await headers() });

    const user = await prisma.user.findUnique({
        where: { id },
        select: {
            id: true,
            name: true,
            email: true,
            image: true,
            role: true,
            createdAt: true,
            contributorProfile: {
                include: {
                    skills: {
                        include: {
                            skill: true,
                        },
                    },
                    portfolioItems: {
                        orderBy: { order: "asc" }
                    }
                },
            },
        },
    });

    if (!user) {
        notFound();
    }

    const isOwnProfile = session?.user?.id === user.id;

    const skills = user.contributorProfile?.skills.map((cs) => ({
        id: cs.skill.id,
        name: cs.skill.name,
        nameAr: cs.skill.nameAr || cs.skill.name,
        category: cs.skill.category,
        level: cs.level,
    })) || [];

    return (
        <div className="min-h-screen bg-waqf-bg">
            <div className="max-w-[1280px] mx-auto px-6 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Column - Profile Card (4 cols) */}
                    <div className="lg:col-span-4">
                        <div className="sticky top-[80px]">
                            <ProfileHeader
                                user={{
                                    name: user.name,
                                    image: user.image,
                                    role: user.role,
                                    bio: user.contributorProfile?.bio,
                                    timezone: user.contributorProfile?.timezone,
                                    githubUsername: user.contributorProfile?.githubUsername,
                                    discord: user.contributorProfile?.discord,
                                    whatsapp: user.contributorProfile?.whatsapp,
                                    createdAt: user.createdAt,
                                    isAvailable: user.contributorProfile?.isAvailable,
                                }}
                                isOwnProfile={isOwnProfile}
                                locale={locale}
                            />

                            {/* Languages Card */}
                            {(user.contributorProfile?.spokenLanguages?.length ?? 0) > 0 && (
                                <div className="mt-6 bg-white rounded-2xl border border-waqf-border p-6">
                                    <h3 className="text-sm font-semibold text-secondary-900 mb-3">
                                        {locale === "ar" ? "اللغات" : "Languages"}
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {user.contributorProfile?.spokenLanguages.map((lang) => (
                                            <span
                                                key={lang}
                                                className="px-3 py-1 text-xs font-medium bg-secondary-100 text-secondary-700 rounded-lg"
                                            >
                                                {lang === "ar" ? "العربية" : lang === "en" ? "English" : lang}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column - Main Content (8 cols) */}
                    <div className="lg:col-span-8 space-y-6">
                        {/* Stats Overview */}
                        <div className="grid grid-cols-3 gap-4">
                            <div className="bg-white rounded-2xl border border-waqf-border p-5">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center">
                                        <FolderOpen className="w-5 h-5" />
                                    </div>
                                </div>
                                <p className="text-2xl font-bold text-secondary-900">12</p>
                                <p className="text-xs text-secondary-500 mt-0.5">
                                    {locale === "ar" ? "مشاريع" : "Projects"}
                                </p>
                            </div>
                            <div className="bg-white rounded-2xl border border-waqf-border p-5">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-xl bg-accent-50 text-accent-600 flex items-center justify-center">
                                        <GitPullRequest className="w-5 h-5" />
                                    </div>
                                </div>
                                <p className="text-2xl font-bold text-secondary-900">48</p>
                                <p className="text-xs text-secondary-500 mt-0.5">
                                    {locale === "ar" ? "مساهمات" : "Contributions"}
                                </p>
                            </div>
                            <div className="bg-white rounded-2xl border border-waqf-border p-5">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center">
                                        <Heart className="w-5 h-5" />
                                    </div>
                                </div>
                                <p className="text-2xl font-bold text-secondary-900">156h</p>
                                <p className="text-xs text-secondary-500 mt-0.5">
                                    {locale === "ar" ? "ساعات الوقف" : "Hours of Waqf"}
                                </p>
                            </div>
                        </div>

                        {/* Contribution Heatmap */}
                        <ContributionHeatmap locale={locale} />

                        {/* Portfolio Grid */}
                        {user.contributorProfile?.portfolioItems && user.contributorProfile.portfolioItems.length > 0 && (
                            <PortfolioGrid items={user.contributorProfile.portfolioItems} locale={locale} />
                        )}

                        {/* Skills Matrix */}
                        <SkillsMatrix skills={skills} locale={locale} />

                        {/* Waqf Timeline */}
                        <WaqfTimeline locale={locale} />
                    </div>
                </div>
            </div>
        </div>
    );
}
