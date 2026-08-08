import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
    Briefcase, FolderGit2, MessageSquare, Bell, Users,
    ArrowRight, Clock, CircleCheck, GitPullRequest, Plus,
    BookOpen, Star
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
    ]);

    const totalApplications = myApplications.length;
    const pendingApps = myApplications.filter(a => a.status === "PENDING").length;
    const acceptedApps = myApplications.filter(a => a.status === "ACCEPTED").length;
    const totalProjects = myProjects.length;
    const openProjects = myProjects.filter(p => p.status === "OPEN").length;
    const totalIncomingApps = myProjects.reduce((sum, p) => sum + p._count.applications, 0);
    const isCreator = totalProjects > 0;

    const greeting = getGreeting(isRtl);

    return (
        <div className="min-h-screen bg-gradient-to-br from-secondary-50 via-white to-primary-50/30">
            <div className="container max-w-6xl mx-auto px-4 py-8">

                <div className="mb-8">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-secondary-900 mb-1">
                                {greeting}, <span className="text-primary-600">{session.user.name?.split(" ")[0]}</span> 👋
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
                                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-secondary-200 rounded-xl text-sm font-medium text-secondary-700 hover:bg-secondary-50 transition-all shadow-sm"
                            >
                                <BookOpen className="w-4 h-4" />
                                {tNav("explore")}
                            </Link>
                            <Link
                                href={`/${locale}/projects/new`}
                                className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 rounded-xl text-sm font-bold text-white hover:bg-primary-700 transition-all shadow-md shadow-primary-600/20"
                            >
                                <Plus className="w-4 h-4" />
                                {tProjects("createProject")}
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <StatCard
                        icon={<Briefcase className="w-5 h-5 text-blue-600" />}
                        bgClass="bg-blue-50"
                        value={totalApplications}
                        label={t("yourApplications")}
                        href={`/${locale}/dashboard/applications`}
                    />
                    <StatCard
                        icon={<CircleCheck className="w-5 h-5 text-green-600" />}
                        bgClass="bg-green-50"
                        value={acceptedApps}
                        label={isRtl ? "مقبولة" : "Accepted"}
                    />
                    <StatCard
                        icon={<FolderGit2 className="w-5 h-5 text-purple-600" />}
                        bgClass="bg-purple-50"
                        value={totalProjects}
                        label={t("yourProjects")}
                        href={`/${locale}/dashboard/projects`}
                    />
                    <StatCard
                        icon={<Bell className="w-5 h-5 text-amber-600" />}
                        bgClass="bg-amber-50"
                        value={unreadNotifications}
                        label={isRtl ? "إشعارات جديدة" : "Unread"}
                        href={`/${locale}/dashboard/notifications`}
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    <div className="lg:col-span-2 space-y-6">

                        {isCreator && (
                            <section className="bg-white rounded-2xl border border-secondary-100 shadow-sm overflow-hidden">
                                <div className="flex items-center justify-between px-6 py-4 border-b border-secondary-100">
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
                                <div className="divide-y divide-secondary-50">
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
                                                    <StatusBadge status={project.status} isRtl={isRtl} />
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

                        <section className="bg-white rounded-2xl border border-secondary-100 shadow-sm overflow-hidden">
                            <div className="flex items-center justify-between px-6 py-4 border-b border-secondary-100">
                                <h2 className="font-bold text-secondary-900 flex items-center gap-2">
                                    <Briefcase className="w-5 h-5 text-blue-600" />
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
                            <div className="divide-y divide-secondary-50">
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
                                                <StatusBadge status={app.status} isRtl={isRtl} />
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

                        <section className="bg-white rounded-2xl border border-secondary-100 shadow-sm overflow-hidden">
                            <div className="flex items-center justify-between px-5 py-4 border-b border-secondary-100">
                                <h3 className="font-bold text-secondary-900 flex items-center gap-2 text-sm">
                                    <Bell className="w-4 h-4 text-amber-500" />
                                    {t("notifications.title")}
                                    {unreadNotifications > 0 && (
                                        <span className="px-1.5 py-0.5 text-[10px] bg-red-100 text-red-600 rounded-full font-bold">
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
                            <div className="divide-y divide-secondary-50">
                                {recentNotifications.length > 0 ? (
                                    recentNotifications.map(notif => (
                                        <div
                                            key={notif.id}
                                            className={`px-5 py-3 ${!notif.read ? "bg-primary-50/20" : ""}`}
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
                            <section className="bg-gradient-to-br from-primary-50 to-primary-100/50 rounded-2xl border border-primary-200/50 p-5">
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
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary-600 text-white text-xs font-medium rounded-lg hover:bg-primary-700 transition-colors"
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

function StatCard({ icon, bgClass, value, label, href }: {
    icon: React.ReactNode;
    bgClass: string;
    value: number;
    label: string;
    href?: string;
}) {
    const content = (
        <div className={`bg-white rounded-2xl border border-secondary-100 shadow-sm p-5 ${href ? "hover:border-primary-200 hover:shadow-md transition-all cursor-pointer group" : ""}`}>
            <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 ${bgClass} rounded-xl flex items-center justify-center`}>
                    {icon}
                </div>
            </div>
            <div className="text-2xl font-bold text-secondary-900">{value}</div>
            <div className="text-xs text-secondary-500 mt-0.5">{label}</div>
        </div>
    );

    return href ? <Link href={href}>{content}</Link> : content;
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

function StatusBadge({ status, isRtl }: { status: string; isRtl: boolean }) {
    const styles: Record<string, string> = {
        PENDING: "bg-amber-100 text-amber-700",
        ACCEPTED: "bg-green-100 text-green-700",
        REJECTED: "bg-red-100 text-red-600",
        OPEN: "bg-emerald-100 text-emerald-700",
        IN_PROGRESS: "bg-blue-100 text-blue-700",
        DRAFT: "bg-secondary-100 text-secondary-600",
        UNDER_REVIEW: "bg-purple-100 text-purple-700",
        COMPLETED: "bg-teal-100 text-teal-700",
    };
    const labels: Record<string, { en: string; ar: string }> = {
        PENDING: { en: "Pending", ar: "قيد الانتظار" },
        ACCEPTED: { en: "Accepted", ar: "مقبول" },
        REJECTED: { en: "Rejected", ar: "مرفوض" },
        OPEN: { en: "Open", ar: "مفتوح" },
        IN_PROGRESS: { en: "In Progress", ar: "قيد التنفيذ" },
        DRAFT: { en: "Draft", ar: "مسودة" },
        UNDER_REVIEW: { en: "Under Review", ar: "قيد المراجعة" },
        COMPLETED: { en: "Completed", ar: "مكتمل" },
    };
    return (
        <span className={`px-2 py-0.5 text-[10px] font-medium rounded-full ${styles[status] || "bg-secondary-100 text-secondary-600"}`}>
            {labels[status] ? (isRtl ? labels[status].ar : labels[status].en) : status}
        </span>
    );
}

function getGreeting(isRtl: boolean): string {
    const hour = new Date().getHours();
    if (hour < 12) return isRtl ? "صباح الخير" : "Good morning";
    if (hour < 18) return isRtl ? "مساء الخير" : "Good afternoon";
    return isRtl ? "مساء الخير" : "Good evening";
}
