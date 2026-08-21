import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { StatusBadge as SharedStatusBadge } from "@/components/ui/Badge";
import Link from "next/link";
import {
    Briefcase, FolderGit2, MessageSquare, Bell, Users,
    ArrowRight, Clock, Plus, BookOpen, Star,
} from "lucide-react";

interface DashboardPageProps {
    params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: DashboardPageProps) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "metadata" });
    return {
        title: t("dashboard"),
    };
}

export default async function DashboardPage({ params }: DashboardPageProps) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "dashboard" });
    const tNav = await getTranslations({ locale, namespace: "nav" });
    const tProjects = await getTranslations({ locale, namespace: "projects" });
    const tProfile = await getTranslations({ locale, namespace: "profile" });
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
        redirect(`/${locale}/login`);
    }
    const userId = session.user.id;
    const isRtl = locale === "ar";

    const [
        profile,
        myApplications,
        myProjects,
        unreadNotifications,
        recentNotifications,
        totalApplications,
        acceptedApps,
        totalProjects,
    ] = await Promise.all([
        prisma.contributorProfile.findUnique({
            where: { userId },
            select: { bio: true },
        }),
        prisma.application.findMany({
            where: { contributorId: userId },
            include: {
                project: { select: { title: true, slug: true, category: true } },
            },
            orderBy: { createdAt: "desc" },
            take: 5,
        }),
        prisma.project.findMany({
            where: { ownerId: userId },
            include: {
                _count: { select: { applications: true } },
            },
            orderBy: { createdAt: "desc" },
            take: 5,
        }),
        prisma.notification.count({
            where: { userId, read: false },
        }),
        prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
            take: 5,
        }),
        prisma.application.count({ where: { contributorId: userId } }),
        prisma.application.count({ where: { contributorId: userId, status: "ACCEPTED" } }),
        prisma.project.count({ where: { ownerId: userId } }),
    ]);

    const isCreator = totalProjects > 0;

    const greeting = getGreeting(isRtl);

    return (
        <div className="min-h-screen bg-waqf-bg">
            <div className="container max-w-6xl mx-auto px-4 py-8">

                <div className="mb-8">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-secondary-900 mb-1">
                                {greeting}, <span className="text-primary-700">{session.user.name?.split(" ")[0]}</span>
                            </h1>
                            <p className="text-secondary-500">
                                {isRtl
                                    ? "هذا ملخص نشاطك على منصة وقف"
                                    : "Here's what's happening on your Waqf journey"}
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <Link
                                href={`/${locale}/explore`}
                                className="flex items-center gap-2 px-4 h-10 bg-white border border-waqf-border rounded-md text-sm font-medium text-secondary-700 hover:bg-secondary-50 transition-colors"
                            >
                                <BookOpen className="w-4 h-4" />
                                {tNav("explore")}
                            </Link>
                            <Link
                                href={`/${locale}/projects/new`}
                                className="flex items-center gap-2 px-4 h-10 bg-primary-600 rounded-md text-sm font-semibold text-white hover:bg-primary-700 transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                                {tProjects("createProject")}
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-8 mb-10">
                    {[
                        { value: totalApplications, label: t("yourApplications"), href: `/${locale}/dashboard/applications` },
                        { value: acceptedApps, label: isRtl ? "مقبولة" : "Accepted" },
                        { value: totalProjects, label: t("yourProjects"), href: `/${locale}/dashboard/projects` },
                        { value: unreadNotifications, label: isRtl ? "إشعارات جديدة" : "Unread", href: `/${locale}/dashboard/notifications` },
                    ].map((stat) => {
                        const content = (
                            <div>
                                <span aria-hidden className="block w-6 h-0.5 bg-accent-500 mb-3" />
                                <p className="text-3xl font-bold tracking-tight text-secondary-900 tabular-nums">
                                    {stat.value}
                                </p>
                                <p className="mt-0.5 text-sm text-secondary-500">{stat.label}</p>
                            </div>
                        );
                        return stat.href ? (
                            <Link key={stat.label} href={stat.href} className="group">
                                {content}
                                <span className="mt-1 inline-block text-xs font-medium text-primary-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {isRtl ? "عرض" : "View"} →
                                </span>
                            </Link>
                        ) : (
                            <div key={stat.label}>{content}</div>
                        );
                    })}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    <div className="lg:col-span-2 space-y-6">

                        {isCreator && (
                            <section className="bg-white rounded-lg border border-waqf-border overflow-hidden">
                                <div className="flex items-center justify-between px-6 py-4 border-b border-waqf-border">
                                    <h2 className="font-bold text-secondary-900 flex items-center gap-2">
                                        <FolderGit2 className="w-5 h-5 text-primary-600" />
                                        {t("yourProjects")}
                                    </h2>
                                    <Link
                                        href={`/${locale}/dashboard/projects`}
                                        className="text-xs font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1"
                                    >
                                        {t("viewAllProjects")}
                                        <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
                                    </Link>
                                </div>
                                <div className="divide-y divide-waqf-border">
                                    {myProjects.map(project => (
                                        <Link
                                            key={project.id}
                                            href={`/${locale}/projects/${project.slug}`}
                                            className="flex items-center gap-4 px-6 py-4 hover:bg-secondary-50/50 transition-colors group"
                                        >
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-secondary-900 truncate group-hover:text-primary-600 transition-colors">
                                                    {project.title}
                                                </p>
                                                <div className="flex items-center gap-3 mt-1 text-xs text-secondary-400">
                                                    <SharedStatusBadge status={project.status} locale={locale} />
                                                    <span className="flex items-center gap-1">
                                                        <Users className="w-3 h-3" />
                                                        {project._count.applications} {isRtl ? "طلب" : "apps"}
                                                    </span>
                                                </div>
                                            </div>
                                            <ArrowRight className="w-4 h-4 text-secondary-300 group-hover:text-primary-500 transition-colors rtl:rotate-180" />
                                        </Link>
                                    ))}
                                    {totalProjects === 0 && (
                                        <div className="px-6 py-8 text-center">
                                            <FolderGit2 className="w-10 h-10 text-secondary-300 mx-auto mb-2" />
                                            <p className="text-sm text-secondary-500">
                                                {t("empty.noProjects")}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </section>
                        )}

                        <section className="bg-white rounded-lg border border-waqf-border overflow-hidden">
                            <div className="flex items-center justify-between px-6 py-4 border-b border-waqf-border">
                                <h2 className="font-bold text-secondary-900 flex items-center gap-2">
                                    <Briefcase className="w-5 h-5 text-primary-600" />
                                    {t("recentApplications")}
                                </h2>
                                <Link
                                    href={`/${locale}/dashboard/applications`}
                                    className="text-xs font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1"
                                >
                                    {t("viewAllApplications")}
                                    <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
                                </Link>
                            </div>
                            <div className="divide-y divide-waqf-border">
                                {myApplications.map(app => (
                                    <Link
                                        key={app.id}
                                        href={`/${locale}/dashboard/applications/${app.id}`}
                                        className="flex items-center gap-4 px-6 py-4 hover:bg-secondary-50/50 transition-colors group"
                                    >
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-secondary-900 truncate group-hover:text-primary-600 transition-colors">
                                                {app.project.title}
                                            </p>
                                            <div className="flex items-center gap-3 mt-1 text-xs text-secondary-400">
                                                <SharedStatusBadge status={app.status} locale={locale} />
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {new Date(app.createdAt).toLocaleDateString(
                                                        isRtl ? "ar-SA" : "en-US",
                                                        { month: "short", day: "numeric" }
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                        <ArrowRight className="w-4 h-4 text-secondary-300 group-hover:text-primary-500 transition-colors rtl:rotate-180" />
                                    </Link>
                                ))}
                                {totalApplications === 0 && (
                                    <div className="px-6 py-8 text-center">
                                        <Briefcase className="w-10 h-10 text-secondary-300 mx-auto mb-2" />
                                        <p className="text-sm text-secondary-500 mb-3">
                                            {t("empty.noApplications")}
                                        </p>
                                        <Link
                                            href={`/${locale}/explore`}
                                            className="text-sm font-medium text-primary-600 hover:text-primary-700"
                                        >
                                            {isRtl ? "استكشف المشاريع ←" : "Explore projects →"}
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>

                    <div className="space-y-6">

                        <section className="bg-white rounded-2xl border border-secondary-100 shadow-sm p-5">
                            <h3 className="font-bold text-secondary-900 mb-4 text-sm">
                                {t("quickActions")}
                            </h3>
                            <div className="space-y-2">
                                <QuickAction
                                    icon={<BookOpen className="w-4 h-4" />}
                                    label={t("browseProjects")}
                                    href={`/${locale}/explore`}
                                />
                                <QuickAction
                                    icon={<Plus className="w-4 h-4" />}
                                    label={t("createNewProject")}
                                    href={`/${locale}/projects/new`}
                                />
                                <QuickAction
                                    icon={<MessageSquare className="w-4 h-4" />}
                                    label={t("messages.title")}
                                    href={`/${locale}/dashboard/messages`}
                                />
                                <QuickAction
                                    icon={<Star className="w-4 h-4" />}
                                    label={tProfile("header.editProfile")}
                                    href={`/${locale}/settings/profile`}
                                />
                            </div>
                        </section>

                        <section className="bg-white rounded-lg border border-waqf-border overflow-hidden">
                            <div className="flex items-center justify-between px-5 py-4 border-b border-waqf-border">
                                <h3 className="font-bold text-secondary-900 flex items-center gap-2 text-sm">
                                    <Bell className="w-4 h-4 text-accent-500" />
                                    {t("notifications.title")}
                                    {unreadNotifications > 0 && (
                                        <span className="px-1.5 py-0.5 text-[10px] bg-accent-500 text-primary-950 rounded font-bold tabular-nums">
                                            {unreadNotifications}
                                        </span>
                                    )}
                                </h3>
                                <Link
                                    href={`/${locale}/dashboard/notifications`}
                                    className="text-xs font-medium text-primary-600 hover:text-primary-700"
                                >
                                    {t("notifications.view")}
                                </Link>
                            </div>
                            <div className="divide-y divide-waqf-border">
                                {recentNotifications.length > 0 ? (
                                    recentNotifications.map(notif => (
                                        <div
                                            key={notif.id}
                                            className={`px-5 py-3 ${!notif.read ? "bg-primary-50/40" : ""}`}
                                        >
                                            <p className={`text-xs ${!notif.read ? "font-semibold text-secondary-900" : "text-secondary-600"}`}>
                                                {notif.title}
                                            </p>
                                            <p className="text-[10px] text-secondary-400 mt-0.5">
                                                {new Date(notif.createdAt).toLocaleDateString(
                                                    isRtl ? "ar-SA" : "en-US",
                                                    { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }
                                                )}
                                            </p>
                                        </div>
                                    ))
                                ) : (
                                    <div className="px-5 py-6 text-center">
                                        <p className="text-xs text-secondary-400">
                                            {t("empty.noNotifications")}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </section>

                        {!profile?.bio && (
                            <section className="rounded-lg border border-primary-200 bg-primary-50 p-5">
                                <h3 className="font-bold text-primary-900 text-sm mb-2">
                                    {isRtl ? "أكمل ملفك الشخصي" : "Complete Your Profile"}
                                </h3>
                                <p className="text-xs text-primary-700 mb-3">
                                    {isRtl
                                        ? "أضف مهاراتك ونبذة عنك لتحصل على توصيات أفضل"
                                        : "Add your skills and bio to get better project recommendations"}
                                </p>
                                <Link
                                    href={`/${locale}/settings/profile`}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary-600 text-white text-xs font-semibold rounded-md hover:bg-primary-700 transition-colors"
                                >
                                    {isRtl ? "إعداد الملف" : "Set Up Profile"}
                                    <ArrowRight className="w-3 h-3 rtl:rotate-180" />
                                </Link>
                            </section>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}


function QuickAction({ icon, label, href }: { icon: React.ReactNode; label: string; href: string }) {
    return (
        <Link
            href={href}
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm text-secondary-600 hover:text-primary-600 hover:bg-primary-50/50 transition-all group"
        >
            <div className="text-secondary-400 group-hover:text-primary-500 transition-colors">{icon}</div>
            <span className="font-medium">{label}</span>
        </Link>
    );
}


function getGreeting(isRtl: boolean): string {
    const hour = new Date().getHours();
    if (hour < 12) return isRtl ? "صباح الخير" : "Good morning";
    if (hour < 18) return isRtl ? "مساء الخير" : "Good afternoon";
    return isRtl ? "مساء الخير" : "Good evening";
}
