import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
    FolderGit2, Plus, Users, Eye, ArrowRight, Clock,
    CheckCircle, AlertCircle, GitPullRequest, Inbox
} from "lucide-react";

interface MyProjectsPageProps {
    params: Promise<{ locale: string }>;
}

export const metadata = {
    title: "My Projects | Waqf",
    description: "Manage your projects on Waqf",
};

export default async function MyProjectsPage({ params }: MyProjectsPageProps) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
        redirect("/login");
    }

    const { locale } = await params;
    const isRtl = locale === "ar";

    const projects = await prisma.project.findMany({
        where: { ownerId: session.user.id },
        include: {
            skills: { include: { skill: true } },
            _count: { select: { applications: true } },
        },
        orderBy: { createdAt: "desc" },
    });

    const statusIcons: Record<string, React.ReactNode> = {
        DRAFT: <Clock className="w-4 h-4 text-secondary-400" />,
        UNDER_REVIEW: <AlertCircle className="w-4 h-4 text-purple-500" />,
        OPEN: <CheckCircle className="w-4 h-4 text-green-500" />,
        IN_PROGRESS: <GitPullRequest className="w-4 h-4 text-blue-500" />,
        COMPLETED: <CheckCircle className="w-4 h-4 text-teal-500" />,
    };

    const statusLabels: Record<string, { en: string; ar: string }> = {
        DRAFT: { en: "Draft", ar: "مسودة" },
        UNDER_REVIEW: { en: "Under Review", ar: "قيد المراجعة" },
        OPEN: { en: "Open", ar: "مفتوح" },
        IN_PROGRESS: { en: "In Progress", ar: "قيد التنفيذ" },
        COMPLETED: { en: "Completed", ar: "مكتمل" },
    };

    const statusStyles: Record<string, string> = {
        DRAFT: "bg-secondary-100 text-secondary-600",
        UNDER_REVIEW: "bg-purple-100 text-purple-700",
        OPEN: "bg-green-100 text-green-700",
        IN_PROGRESS: "bg-blue-100 text-blue-700",
        COMPLETED: "bg-teal-100 text-teal-700",
    };

    return (
        <div className="min-h-screen bg-secondary-50">
            <div className="container max-w-5xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-secondary-900 flex items-center gap-3">
                            <FolderGit2 className="w-7 h-7 text-primary-600" />
                            {isRtl ? "مشاريعي" : "My Projects"}
                        </h1>
                        <p className="text-secondary-500 mt-1">
                            {isRtl
                                ? `${projects.length} مشروع`
                                : `${projects.length} project${projects.length !== 1 ? "s" : ""}`}
                        </p>
                    </div>
                    <Link
                        href={`/${locale}/projects/new`}
                        className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white font-bold text-sm rounded-xl hover:bg-primary-700 transition-all shadow-md shadow-primary-600/20"
                    >
                        <Plus className="w-4 h-4" />
                        {isRtl ? "مشروع جديد" : "New Project"}
                    </Link>
                </div>

                {/* Projects List */}
                {projects.length > 0 ? (
                    <div className="space-y-4">
                        {projects.map(project => (
                            <div
                                key={project.id}
                                className="bg-white rounded-2xl border border-secondary-100 shadow-sm hover:border-primary-200 hover:shadow-md transition-all overflow-hidden"
                            >
                                <div className="p-6">
                                    <div className="flex items-start justify-between gap-4 mb-3">
                                        <div className="flex-1 min-w-0">
                                            <Link
                                                href={`/${locale}/projects/${project.slug}`}
                                                className="text-lg font-bold text-secondary-900 hover:text-primary-600 transition-colors"
                                            >
                                                {project.title}
                                            </Link>
                                            <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-secondary-400">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusStyles[project.status] || "bg-secondary-100 text-secondary-600"}`}>
                                                    {statusIcons[project.status]}
                                                    {statusLabels[project.status]
                                                        ? (isRtl ? statusLabels[project.status].ar : statusLabels[project.status].en)
                                                        : project.status}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Users className="w-3.5 h-3.5" />
                                                    {project._count.applications} {isRtl ? "طلب" : "applications"}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Eye className="w-3.5 h-3.5" />
                                                    {project.viewCount} {isRtl ? "مشاهدة" : "views"}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-3.5 h-3.5" />
                                                    {new Date(project.createdAt).toLocaleDateString(
                                                        isRtl ? "ar-SA" : "en-US",
                                                        { month: "short", day: "numeric", year: "numeric" }
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Skills */}
                                    {project.skills.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5 mt-3">
                                            {project.skills.slice(0, 5).map((ps, i) => (
                                                <span key={i} className="px-2 py-0.5 bg-secondary-50 text-secondary-500 text-xs rounded-md">
                                                    {isRtl ? ps.skill.nameAr || ps.skill.name : ps.skill.name}
                                                </span>
                                            ))}
                                            {project.skills.length > 5 && (
                                                <span className="px-2 py-0.5 bg-secondary-50 text-secondary-400 text-xs rounded-md">
                                                    +{project.skills.length - 5}
                                                </span>
                                            )}
                                        </div>
                                    )}

                                    {/* Actions */}
                                    <div className="flex gap-3 mt-4 pt-4 border-t border-secondary-50">
                                        <Link
                                            href={`/${locale}/projects/${project.slug}`}
                                            className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1"
                                        >
                                            {isRtl ? "عرض" : "View"}
                                            <ArrowRight className="w-3.5 h-3.5" />
                                        </Link>
                                        <Link
                                            href={`/${locale}/projects/${project.slug}/edit`}
                                            className="text-sm font-medium text-secondary-500 hover:text-secondary-700"
                                        >
                                            {isRtl ? "تعديل" : "Edit"}
                                        </Link>
                                        {project._count.applications > 0 && (
                                            <Link
                                                href={`/${locale}/projects/${project.slug}/applications`}
                                                className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
                                            >
                                                <Users className="w-3.5 h-3.5" />
                                                {isRtl ? "الطلبات" : "Applications"}
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl border border-secondary-100 p-12 text-center">
                        <div className="w-16 h-16 mx-auto mb-4 bg-secondary-100 rounded-full flex items-center justify-center">
                            <Inbox className="w-8 h-8 text-secondary-400" />
                        </div>
                        <h3 className="text-lg font-bold text-secondary-900 mb-2">
                            {isRtl ? "لم تنشئ أي مشروع بعد" : "No projects yet"}
                        </h3>
                        <p className="text-secondary-500 mb-6 max-w-md mx-auto">
                            {isRtl
                                ? "ابدأ بإنشاء مشروعك الأول وشارك مهاراتك كصدقة جارية"
                                : "Start by creating your first project and share your skills as sadaqah jariyah"}
                        </p>
                        <Link
                            href={`/${locale}/projects/new`}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 transition-colors shadow-md"
                        >
                            <Plus className="w-5 h-5" />
                            {isRtl ? "أنشئ مشروعًا" : "Create a Project"}
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
