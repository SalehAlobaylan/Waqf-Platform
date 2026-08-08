import { notFound } from "next/navigation";
import Link from "next/link";
import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import {
    BookOpen, Heart, Star, Share2, SquareArrowOutUpRight,
    Calendar, Users, Clock, CircleCheck, Circle,
    ChevronRight, GitPullRequest, CircleAlert, Eye, Sparkles
} from "lucide-react";
import { SiGithub } from "@icons-pack/react-simple-icons";
import { ViewTracker } from "@/components/projects/ViewTracker";
import { SimilarProjects } from "@/components/projects/SimilarProjects";
import { StatusWorkflow } from "@/components/projects/StatusWorkflow";
import { ReportButton } from "@/components/reports/ReportButton";
import { ApplyButton } from "@/components/applications/ApplyButton";

interface ProjectPageProps {
    params: Promise<{ locale: string; slug: string }>;
}

const categoryIcons: Record<string, { emoji: string; bgClass: string; textClass: string }> = {
    QURAN: { emoji: "📖", bgClass: "bg-indigo-100", textClass: "text-indigo-700" },
    PRAYER: { emoji: "🕌", bgClass: "bg-emerald-100", textClass: "text-emerald-700" },
    CHARITY: { emoji: "🤲", bgClass: "bg-amber-100", textClass: "text-amber-700" },
    EDUCATION: { emoji: "📚", bgClass: "bg-blue-100", textClass: "text-blue-700" },
    COMMUNITY: { emoji: "👥", bgClass: "bg-purple-100", textClass: "text-purple-700" },
    TOOLS: { emoji: "⚙️", bgClass: "bg-slate-100", textClass: "text-slate-700" },
};

const categoryLabels: Record<string, { en: string; ar: string }> = {
    QURAN: { en: "Quran", ar: "القرآن" },
    PRAYER: { en: "Prayer", ar: "الصلاة" },
    CHARITY: { en: "Charity", ar: "الصدقة" },
    EDUCATION: { en: "Education", ar: "التعليم" },
    COMMUNITY: { en: "Community", ar: "المجتمع" },
    TOOLS: { en: "Tools", ar: "الأدوات" },
};

const statusLabels: Record<string, { en: string; ar: string; color: string }> = {
    DRAFT: { en: "Draft", ar: "مسودة", color: "bg-secondary-100 text-secondary-600" },
    PENDING: { en: "Pending Review", ar: "قيد المراجعة", color: "bg-amber-100 text-amber-700" },
    OPEN: { en: "Open", ar: "مفتوح", color: "bg-green-100 text-green-700" },
    IN_PROGRESS: { en: "In Progress", ar: "قيد التنفيذ", color: "bg-blue-100 text-blue-700" },
    COMPLETED: { en: "Completed", ar: "مكتمل", color: "bg-primary-100 text-primary-700" },
    CANCELLED: { en: "Cancelled", ar: "ملغى", color: "bg-red-100 text-red-700" },
};

export async function generateMetadata({ params }: ProjectPageProps) {
    const { slug } = await params;
    const project = await prisma.project.findUnique({
        where: { slug },
        select: { title: true, description: true },
    });

    return {
        title: project ? `${project.title} | Waqf` : "Project | Waqf",
        description: project?.description?.slice(0, 160) || "View project details on Waqf",
    };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
    const { locale, slug } = await params;
    const session = await auth.api.getSession({ headers: await headers() });
    const t = await getTranslations({ locale, namespace: "projectDetail" });
    const tc = await getTranslations({ locale, namespace: "common" });

    const project = await prisma.project.findUnique({
        where: { slug },
        include: {
            skills: { include: { skill: true } },
            owner: { select: { id: true, username: true, name: true, image: true } },
            organization: { select: { id: true, name: true, logo: true } },
            _count: { select: { applications: true } },
        },
    });

    if (!project) {
        notFound();
    }

    const isExternal = project.source === "EXTERNAL";

    // Non-public statuses (DRAFT, PENDING) are only visible to the owner or admins
    if (!["OPEN", "IN_PROGRESS", "COMPLETED", "CANCELLED"].includes(project.status)) {
        const isViewerOwner = !isExternal && session?.user?.id === project.owner?.id;
        const isAdminViewer = session?.user?.role === "ADMIN";
        if (!isViewerOwner && !isAdminViewer) {
            notFound();
        }
    }

    const isOwner = !isExternal && session?.user?.id === project.owner?.id;
    const myApplication = session?.user?.id
        ? await prisma.application.findFirst({
              where: {
                  projectId: project.id,
                  contributorId: session.user.id,
              },
              select: { id: true, status: true },
          })
        : null;
    const requiredSkills = project.skills.filter((s) => s.isRequired);
    const optionalSkills = project.skills.filter((s) => !s.isRequired);
    const icon = categoryIcons[project.category] || { emoji: "📦", bgClass: "bg-gray-100", textClass: "text-gray-700" };
    const catLabel = categoryLabels[project.category];
    const stLabel = statusLabels[project.status];

    return (
        <div className="min-h-screen bg-waqf-bg">
            {/* View count tracker */}
            <ViewTracker projectId={project.id} />

            {/* Breadcrumbs */}
            <div className="max-w-[1280px] mx-auto px-6 pt-6">
                <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-secondary-500">
                    <Link href={`/${locale}/explore`} className="hover:text-primary-600 transition-colors">
                        {t("breadcrumbs.explore")}
                    </Link>
                    <ChevronRight className="w-3.5 h-3.5 rtl:rotate-180" />
                    <span className="text-secondary-400">
                        {catLabel ? catLabel[locale as "ar" | "en"] : project.category}
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 rtl:rotate-180" />
                    <span className="text-secondary-900 font-medium truncate max-w-[200px]">{project.title}</span>
                </nav>
            </div>

            {/* Featured Image */}
            {project.featuredImage && (
                <div className="max-w-[1280px] mx-auto px-6 pt-4">
                    <div className="rounded-2xl overflow-hidden border border-waqf-border shadow-sm">
                        <img src={project.featuredImage} alt={project.title} className="w-full h-64 md:h-80 object-cover" />
                    </div>
                </div>
            )}

            {/* External / Curated Banner */}
            {isExternal && project.externalUrl && (
                <div className="max-w-[1280px] mx-auto px-6 pt-4">
                    <div className="rounded-2xl border border-purple-200 bg-gradient-to-br from-purple-50 to-white p-6 md:p-8 shadow-sm">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div className="flex-1">
                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold mb-2">
                                    <Sparkles className="w-3.5 h-3.5" />
                                    {t("curatedByWaqf")}
                                </div>
                                <h2 className="text-xl md:text-2xl font-bold text-secondary-900 mb-1">
                                    {t("externalProjectNotice")}
                                </h2>
                                <p className="text-sm text-secondary-600">
                                    {t("externalProjectDescription")}
                                </p>
                                {project.externalOwnerName && (
                                    <p className="text-xs text-secondary-500 mt-2">
                                        {t("externalOwnerLabel")}: <span className="font-medium text-secondary-700">{project.externalOwnerName}</span>
                                    </p>
                                )}
                            </div>
                            <div className="flex flex-col sm:flex-row gap-2 shrink-0">
                                <a
                                    href={project.externalUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 transition-colors shadow-md shadow-primary-600/20"
                                >
                                    {t("visitProject")}
                                    <SquareArrowOutUpRight className="w-4 h-4" />
                                </a>
                                {project.externalOwnerContact && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(project.externalOwnerContact) && (
                                    <a
                                        href={`mailto:${project.externalOwnerContact}`}
                                        className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-white border border-secondary-200 text-secondary-700 font-medium rounded-xl hover:bg-secondary-50 transition-colors"
                                    >
                                        {t("contactOwner")}
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Hero Card */}
            <div className="max-w-[1280px] mx-auto px-6 py-6">
                <div className="bg-white rounded-2xl border border-waqf-border p-8 shadow-sm">
                    <div className="flex flex-col md:flex-row md:items-start gap-6">
                        <div className={`w-14 h-14 ${icon.bgClass} rounded-2xl flex items-center justify-center text-2xl shrink-0`}>
                            {icon.emoji}
                        </div>
                        <div className="flex-1">
                            <div className="flex flex-wrap gap-2 mb-3">
                                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${stLabel?.color || "bg-secondary-100 text-secondary-600"}`}>
                                    {stLabel ? stLabel[locale as "ar" | "en"] : project.status}
                                </span>
                                {isExternal && (
                                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-700 inline-flex items-center gap-1">
                                        <SquareArrowOutUpRight className="w-3 h-3" />
                                        {t("externalBadge")}
                                    </span>
                                )}
                                {project.status === "OPEN" && !isExternal && (
                                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-accent-500/10 text-accent-600">
                                        {t("helpWanted")}
                                    </span>
                                )}
                            </div>
                            <h1 className="text-2xl md:text-3xl font-bold text-secondary-900 mb-3 tracking-tight">
                                {project.title}
                            </h1>
                            <p className="text-secondary-500 max-w-2xl leading-relaxed">
                                {project.description?.slice(0, 180)}
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-3 shrink-0 md:flex-col">
                            {isExternal && project.externalUrl ? (
                                <a
                                    href={project.externalUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 transition-colors shadow-md shadow-primary-600/20"
                                >
                                    {t("visitProject")}
                                    <SquareArrowOutUpRight className="w-4 h-4" />
                                </a>
                            ) : isOwner ? (
                                <Link
                                    href={`/${locale}/projects/${project.slug}/edit`}
                                    className="flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 transition-colors shadow-md shadow-primary-600/20"
                                >
                                    {t("editProject")}
                                </Link>
                            ) : !session ? (
                                <Link
                                    href={`/${locale}/login`}
                                    className="flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 transition-colors shadow-md shadow-primary-600/20"
                                >
                                    {t("contributeNow")}
                                </Link>
                            ) : project.status === "OPEN" ? (
                                <ApplyButton
                                    project={{
                                        id: project.id,
                                        title: project.title,
                                        slug: project.slug,
                                    }}
                                    existingApplicationId={myApplication?.id}
                                />
                            ) : null}
                            <div className="flex gap-2">
                                <button aria-label={t("star")} className="flex items-center gap-2 px-4 py-2.5 border border-secondary-200 rounded-xl bg-white hover:bg-secondary-50 transition-colors text-sm font-medium text-secondary-700">
                                    <Star className="w-4 h-4" />
                                    {t("star")}
                                </button>
                                <button aria-label={t("share")} className="flex items-center gap-2 px-4 py-2.5 border border-secondary-200 rounded-xl bg-white hover:bg-secondary-50 transition-colors text-sm font-medium text-secondary-700">
                                    <Share2 className="w-4 h-4" />
                                    {t("share")}
                                </button>
                            </div>
                            {!isOwner && (
                                <ReportButton targetType="PROJECT" targetId={project.id} />
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Admin Feedback Banner (for project owner) */}
            {isOwner && project.adminFeedback && project.status === "DRAFT" && (
                <div className="max-w-[1280px] mx-auto px-6 pb-4">
                    <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200">
                        <div className="flex items-start gap-3">
                            <CircleAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                            <div>
                                <h3 className="font-bold text-amber-800 mb-1">
                                    {t("adminFeedbackTitle")}
                                </h3>
                                <p className="text-sm text-amber-700">
                                    {t("adminFeedbackDesc")}
                                </p>
                                <p className="mt-2 text-amber-900 bg-amber-100 rounded-xl p-3 text-sm">{project.adminFeedback}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 8+4 Grid Layout */}
            <div className="max-w-[1280px] mx-auto px-6 pb-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Main Content (8 cols) */}
                    <div className="lg:col-span-8 space-y-6">
                        {/* Project Impact */}
                        {project.impact && (
                            <div className="rounded-2xl p-6 bg-gradient-to-br from-primary-600 to-primary-800 text-white relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -mr-10 -mt-10"></div>
                                <div className="relative z-10">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Heart className="w-5 h-5 text-accent-400" fill="currentColor" />
                                        <h2 className="text-lg font-bold">
                                            {t("projectImpact")}
                                        </h2>
                                    </div>
                                    <p className="text-white/90 leading-relaxed">{project.impact}</p>
                                </div>
                            </div>
                        )}

                        {/* About / README */}
                        <div className="bg-white rounded-2xl border border-waqf-border p-6">
                            <h2 className="text-lg font-bold text-secondary-900 mb-4 flex items-center gap-2">
                                <BookOpen className="w-5 h-5 text-secondary-400" />
                                {t("aboutThisProject")}
                            </h2>
                            <div className="prose prose-secondary max-w-none">
                                <p className="text-secondary-700 whitespace-pre-wrap leading-relaxed">{project.description}</p>
                            </div>
                        </div>

                        {/* Required Skills */}
                        <div className="bg-white rounded-2xl border border-waqf-border p-6">
                            <h2 className="text-lg font-bold text-secondary-900 mb-4">
                                {t("requiredSkills")}
                            </h2>

                            {requiredSkills.length > 0 && (
                                <div className="mb-5">
                                    <p className="text-sm font-medium text-secondary-500 mb-3">
                                        {t("required")}
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {requiredSkills.map((ps) => (
                                            <span
                                                key={ps.skillId}
                                                className="px-3 py-1.5 bg-primary-50 text-primary-700 border border-primary-200 rounded-lg text-sm font-medium"
                                            >
                                                {locale === "ar" ? ps.skill.nameAr : ps.skill.name}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {optionalSkills.length > 0 && (
                                <div>
                                    <p className="text-sm font-medium text-secondary-500 mb-3">
                                        {t("niceToHave")}
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {optionalSkills.map((ps) => (
                                            <span
                                                key={ps.skillId}
                                                className="px-3 py-1.5 bg-secondary-50 text-secondary-600 rounded-lg text-sm"
                                            >
                                                {locale === "ar" ? ps.skill.nameAr : ps.skill.name}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Roadmap */}
                        <div className="bg-white rounded-2xl border border-waqf-border p-6">
                            <h2 className="text-lg font-bold text-secondary-900 mb-4">
                                {t("roadmap")}
                            </h2>
                            <div className="space-y-4">
                                {[
                                    { key: "infra", done: true },
                                    { key: "design", done: true },
                                    { key: "core", done: false },
                                    { key: "deploy", done: false },
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        {item.done ? (
                                            <CircleCheck className="w-5 h-5 text-primary-600 shrink-0" />
                                        ) : (
                                            <Circle className="w-5 h-5 text-secondary-300 shrink-0" />
                                        )}
                                        <span className={`text-sm ${item.done ? "text-secondary-900 font-medium" : "text-secondary-500"}`}>
                                            {t(`roadmapSteps.${item.key}`)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div className="bg-white rounded-2xl border border-waqf-border p-6">
                            <h2 className="text-lg font-bold text-secondary-900 mb-4">
                                {t("recentActivity")}
                            </h2>
                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0 mt-0.5">
                                        <GitPullRequest className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-secondary-900">
                                            <span className="font-medium">{t("activity.prMerged")}</span>{" "}
                                            {t("activity.prMergedTitle")}
                                        </p>
                                        <p className="text-xs text-secondary-400 mt-1">
                                            {t("activity.prMergedTime")}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                                        <CircleAlert className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-secondary-900">
                                            <span className="font-medium">{t("activity.issue")}</span>{" "}
                                            {t("activity.issueTitle")}
                                        </p>
                                        <p className="text-xs text-secondary-400 mt-1">
                                            {t("activity.issueTime")}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar (4 cols) */}
                    <div className="lg:col-span-4 space-y-6">
                        {/* Status Workflow (owner only, internal projects) */}
                        {isOwner && (
                            <StatusWorkflow
                                projectId={project.id}
                                currentStatus={project.status}
                                adminFeedback={project.adminFeedback}
                                locale={locale}
                            />
                        )}

                        {/* Project Details */}
                        <div className="bg-white rounded-2xl border border-waqf-border p-6 sticky top-[80px]">
                            <h3 className="text-sm font-semibold text-secondary-900 mb-4">
                                {t("details")}
                            </h3>
                            <dl className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <dt className="text-secondary-500 flex items-center gap-1.5">
                                        <Calendar className="w-4 h-4" />
                                        {t("created")}
                                    </dt>
                                    <dd className="font-medium text-secondary-900">
                                        {new Date(project.createdAt).toLocaleDateString(locale === "ar" ? "ar-SA" : "en-US", {
                                            year: "numeric",
                                            month: "short",
                                        })}
                                    </dd>
                                </div>
                                {!isExternal && (
                                    <>
                                        <div className="flex justify-between">
                                            <dt className="text-secondary-500 flex items-center gap-1.5">
                                                <Users className="w-4 h-4" />
                                                {t("applicants")}
                                            </dt>
                                            <dd className="font-medium text-secondary-900">{project._count.applications}</dd>
                                        </div>
                                        <div className="flex justify-between">
                                            <dt className="text-secondary-500 flex items-center gap-1.5">
                                                <Eye className="w-4 h-4" />
                                                {t("views")}
                                            </dt>
                                            <dd className="font-medium text-secondary-900">{project.viewCount}</dd>
                                        </div>
                                    </>
                                )}
                                {project.timeCommitment && (
                                    <div className="flex justify-between">
                                        <dt className="text-secondary-500 flex items-center gap-1.5">
                                            <Clock className="w-4 h-4" />
                                            {t("commitment")}
                                        </dt>
                                        <dd className="font-medium text-secondary-900">{project.timeCommitment}</dd>
                                    </div>
                                )}
                            </dl>
                        </div>

                        {/* Tech Stack */}
                        {project.skills.length > 0 && (
                            <div className="bg-white rounded-2xl border border-waqf-border p-6">
                                <h3 className="text-sm font-semibold text-secondary-900 mb-3">
                                    {t("techStack")}
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {project.skills.slice(0, 6).map((ps) => (
                                        <span
                                            key={ps.skillId}
                                            className="px-3 py-1.5 bg-secondary-50 text-secondary-700 rounded-lg text-xs font-medium"
                                        >
                                            {locale === "ar" ? ps.skill.nameAr : ps.skill.name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Repository / External Link */}
                        <div className="bg-white rounded-2xl border border-waqf-border p-6">
                            <h3 className="text-sm font-semibold text-secondary-900 mb-3">
                                {t("links")}
                            </h3>
                            <div className="space-y-2">
                                {isExternal && project.externalUrl && (
                                    <a
                                        href={project.externalUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-3 p-3 rounded-xl border border-secondary-200 hover:border-primary-600/40 hover:bg-primary-50/50 transition-all group"
                                    >
                                        <SquareArrowOutUpRight className="w-5 h-5 text-secondary-500 group-hover:text-primary-600" />
                                        <span className="text-sm font-medium text-secondary-700 group-hover:text-primary-600">
                                            {t("visitProject")}
                                        </span>
                                        <SquareArrowOutUpRight className="w-3.5 h-3.5 text-secondary-400 ms-auto" />
                                    </a>
                                )}
                                {!isExternal && project.githubUrl && (
                                    <a
                                        href={project.githubUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-3 p-3 rounded-xl border border-secondary-200 hover:border-primary-600/40 hover:bg-primary-50/50 transition-all group"
                                    >
                                        <SiGithub className="w-5 h-5 text-secondary-500 group-hover:text-primary-600" />
                                        <span className="text-sm font-medium text-secondary-700 group-hover:text-primary-600">
                                            {t("viewRepository")}
                                        </span>
                                        <SquareArrowOutUpRight className="w-3.5 h-3.5 text-secondary-400 ms-auto" />
                                    </a>
                                )}
                            </div>
                        </div>

                        {/* Creator Profile (internal projects only) */}
                        {!isExternal && project.owner && (
                            <div className="bg-white rounded-2xl border border-waqf-border p-6">
                                <h3 className="text-sm font-semibold text-secondary-900 mb-4">
                                    {t("projectCreator")}
                                </h3>
                                <Link
                                    href={`/${locale}/profile/${project.owner.username ?? project.owner.id}`}
                                    className="flex items-center gap-3 group mb-4"
                                >
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-lg font-bold shadow-md">
                                        {project.owner.name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-secondary-900 group-hover:text-primary-600 transition-colors">
                                            {project.owner.name}
                                        </p>
                                        <p className="text-xs text-secondary-500">
                                            {t("viewProfile")}
                                        </p>
                                    </div>
                                </Link>
                                {myApplication && (
                                    <Link
                                        href={`/${locale}/dashboard/applications/${myApplication.id}`}
                                        className="w-full px-4 py-2.5 border border-secondary-200 rounded-xl text-sm font-medium text-secondary-700 hover:bg-secondary-50 transition-colors text-center block"
                                    >
                                        {t("contactCreator")}
                                    </Link>
                                )}
                            </div>
                        )}

                        {/* External Project Info (replaces Creator Profile) */}
                        {isExternal && project.externalOwnerName && (
                            <div className="bg-white rounded-2xl border border-purple-200 p-6">
                                <h3 className="text-sm font-semibold text-secondary-900 mb-4">
                                    {t("curatedByWaqf")}
                                </h3>
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center text-white text-lg font-bold shadow-md">
                                        {project.externalOwnerName.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-secondary-900">
                                            {project.externalOwnerName}
                                        </p>
                                        <p className="text-xs text-secondary-500">
                                            {t("originalOwner")}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Similar Projects (dynamic) */}
                        <SimilarProjects projectId={project.id} locale={locale} />
                    </div>
                </div>
            </div>
        </div>
    );
}
