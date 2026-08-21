import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { SkillsMatrix } from "@/components/profile/SkillsMatrix";
import { ContributionHeatmap } from "@/components/profile/ContributionHeatmap";
import { WaqfTimeline } from "@/components/profile/WaqfTimeline";
import { PortfolioGrid } from "@/components/profile/PortfolioGrid";

interface ProfilePageProps {
    params: Promise<{ locale: string; handle: string }>;
}

async function findUserByHandle(handle: string) {
    const byUsername = await prisma.user.findUnique({
        where: { username: handle },
        select: userSelect,
    });
    if (byUsername) return byUsername;
    return prisma.user.findUnique({
        where: { id: handle },
        select: userSelect,
    });
}

const userSelect = {
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
} as const;

export async function generateMetadata({ params }: ProfilePageProps) {
    const { handle } = await params;
    const user = await findUserByHandle(handle);
    return {
        title: user ? `${user.name} | Waqf` : "Profile | Waqf",
        description: user ? `View ${user.name}'s contributor profile on Waqf` : "Contributor profile",
    };
}

export default async function ProfilePage({ params }: ProfilePageProps) {
    const { locale, handle } = await params;
    const session = await auth.api.getSession({ headers: await headers() });

    const user = await findUserByHandle(handle);

    if (!user) {
        notFound();
    }

    const isOwnProfile = session?.user?.id === user.id;

    // Real contribution data
    const [ownedProjects, acceptedApplications] = await Promise.all([
        prisma.project.count({ where: { ownerId: user.id, status: { not: "DRAFT" } } }),
        prisma.application.findMany({
            where: { contributorId: user.id, status: "ACCEPTED" },
            select: { createdAt: true, project: { select: { title: true } } },
            orderBy: { createdAt: "desc" },
        }),
    ]);

    const heatmapDates = acceptedApplications.map((a) => a.createdAt.toISOString());
    const timelineEntries = acceptedApplications.slice(0, 8).map((a) => ({
        project: a.project.title,
        date: a.createdAt.toISOString(),
    }));

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
                                <div className="mt-6 bg-white rounded-lg border border-waqf-border p-6">
                                    <h3 className="text-sm font-semibold text-secondary-900 mb-3">
                                        {locale === "ar" ? "اللغات" : "Languages"}
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {user.contributorProfile?.spokenLanguages.map((lang) => (
                                            <span
                                                key={lang}
                                                className="px-2.5 py-1 text-xs font-medium bg-secondary-100 text-secondary-700 rounded"
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
                        {/* Stats Overview — real counts only */}
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <span aria-hidden className="block w-6 h-0.5 bg-accent-500 mb-3" />
                                <p className="text-3xl font-bold tracking-tight text-secondary-900 tabular-nums">
                                    {ownedProjects}
                                </p>
                                <p className="mt-0.5 text-sm text-secondary-500">
                                    {locale === "ar" ? "مشاريع" : "Projects"}
                                </p>
                            </div>
                            <div>
                                <span aria-hidden className="block w-6 h-0.5 bg-accent-500 mb-3" />
                                <p className="text-3xl font-bold tracking-tight text-secondary-900 tabular-nums">
                                    {acceptedApplications.length}
                                </p>
                                <p className="mt-0.5 text-sm text-secondary-500">
                                    {locale === "ar" ? "مساهمات مقبولة" : "Accepted contributions"}
                                </p>
                            </div>
                        </div>

                        {/* Contribution Heatmap (renders nothing without data) */}
                        <ContributionHeatmap locale={locale} dates={heatmapDates} />

                        {/* Portfolio Grid */}
                        {user.contributorProfile?.portfolioItems && user.contributorProfile.portfolioItems.length > 0 && (
                            <PortfolioGrid items={user.contributorProfile.portfolioItems} locale={locale} />
                        )}

                        {/* Skills Matrix */}
                        <SkillsMatrix skills={skills} locale={locale} />

                        {/* Waqf Timeline (real accepted applications; renders nothing when empty) */}
                        <WaqfTimeline locale={locale} entries={timelineEntries} />
                    </div>
                </div>
            </div>
        </div>
    );
}
