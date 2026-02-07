import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { SkillsMatrix } from "@/components/profile/SkillsMatrix";

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
    const session = await auth();

    // Fetch user with profile
    const user = await prisma.user.findUnique({
        where: { id },
        select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            role: true,
            createdAt: true,
            contributorProfile: {
                include: {
                    skills: {
                        include: {
                            skill: true,
                        },
                    },
                },
            },
        },
    });

    if (!user) {
        notFound();
    }

    const isOwnProfile = session?.user?.id === user.id;

    // Transform skills (handle null nameAr)
    const skills = user.contributorProfile?.skills.map((cs) => ({
        id: cs.skill.id,
        name: cs.skill.name,
        nameAr: cs.skill.nameAr || cs.skill.name,
        category: cs.skill.category,
        level: cs.level,
    })) || [];

    return (
        <div className="container max-w-4xl mx-auto px-4 py-8">
            <ProfileHeader
                user={{
                    name: user.name,
                    avatar: user.avatar,
                    role: user.role,
                    bio: user.contributorProfile?.bio,
                    timezone: user.contributorProfile?.timezone,
                    githubUsername: user.contributorProfile?.githubUsername,
                    createdAt: user.createdAt,
                    isAvailable: user.contributorProfile?.isAvailable,
                }}
                isOwnProfile={isOwnProfile}
            />

            <div className="mt-6 grid gap-6 md:grid-cols-3">
                {/* Main Content */}
                <div className="md:col-span-2 space-y-6">
                    <SkillsMatrix skills={skills} locale={locale} />

                    {/* Waqf History Placeholder */}
                    <div className="bg-white rounded-xl border border-secondary-100 p-6">
                        <h3 className="text-lg font-semibold text-secondary-900 mb-4">
                            {locale === "ar" ? "تاريخ المساهمات" : "Contribution History"}
                        </h3>
                        <p className="text-secondary-500 text-sm">
                            {locale === "ar" ? "لا توجد مساهمات بعد" : "No contributions yet"}
                        </p>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Stats */}
                    <div className="bg-white rounded-xl border border-secondary-100 p-6">
                        <h3 className="text-lg font-semibold text-secondary-900 mb-4">
                            {locale === "ar" ? "الإحصائيات" : "Stats"}
                        </h3>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-secondary-600 text-sm">
                                    {locale === "ar" ? "المشاريع" : "Projects"}
                                </span>
                                <span className="font-semibold text-secondary-900">0</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-secondary-600 text-sm">
                                    {locale === "ar" ? "ساعات المساهمة" : "Hours Contributed"}
                                </span>
                                <span className="font-semibold text-secondary-900">0</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-secondary-600 text-sm">
                                    {locale === "ar" ? "متاح" : "Availability"}
                                </span>
                                <span className="font-semibold text-secondary-900">
                                    {user.contributorProfile?.hoursPerWeek || 0}h/week
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Languages */}
                    {(user.contributorProfile?.spokenLanguages?.length ?? 0) > 0 && (
                        <div className="bg-white rounded-xl border border-secondary-100 p-6">
                            <h3 className="text-lg font-semibold text-secondary-900 mb-4">
                                {locale === "ar" ? "اللغات" : "Languages"}
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {user.contributorProfile?.spokenLanguages.map((lang) => (
                                    <span
                                        key={lang}
                                        className="px-3 py-1 text-sm bg-secondary-100 text-secondary-700 rounded-lg"
                                    >
                                        {lang === "ar" ? "العربية" : lang === "en" ? "English" : lang}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
