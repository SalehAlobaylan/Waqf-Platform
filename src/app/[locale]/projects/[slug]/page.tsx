import { notFound } from "next/navigation";
import Link from "next/link";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import {
    BookOpen, Heart, Star, Share2, ExternalLink, Github,
    Calendar, Users, Clock, CheckCircle, Circle,
    ChevronRight, GitPullRequest, AlertCircle, Eye
} from "lucide-react";
import { ViewTracker } from "@/components/projects/ViewTracker";
import { SimilarProjects } from "@/components/projects/SimilarProjects";
import { StatusWorkflow } from "@/components/projects/StatusWorkflow";
import { ReportButton } from "@/components/reports/ReportButton";

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

    const project = await prisma.project.findUnique({
        where: { slug },
        include: {
            skills: { include: { skill: true } },
            owner: { select: { id: true, name: true, image: true } },
            organization: { select: { id: true, name: true, logo: true } },
            _count: { select: { applications: true } },
        },
    });

    if (!project) {
        notFound();
    }

    const isOwner = session?.user?.id === project.owner.id;
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
                <nav className="flex items-center gap-2 text-sm text-secondary-500">
                    <Link href={`/${locale}/explore`} className="hover:text-primary-600 transition-colors">
                        {locale === "ar" ? "استكشاف" : "Explore"}
                    </Link>
                    <ChevronRight className={`w-3.5 h-3.5 ${locale === "ar" ? "rotate-180" : ""}`} />
                    <span className="text-secondary-400">
                        {catLabel ? (locale === "ar" ? catLabel.ar : catLabel.en) : project.category}
                    </span>
                    <ChevronRight className={`w-3.5 h-3.5 ${locale === "ar" ? "rotate-180" : ""}`} />
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
                                    {stLabel ? (locale === "ar" ? stLabel.ar : stLabel.en) : project.status}
                                </span>
                                {project.status === "OPEN" && (
                                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-accent-500/10 text-accent-600">
                                        {locale === "ar" ? "يحتاج مساعدة" : "Help Wanted"}
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
                            {isOwner ? (
                                <Link
                                    href={`/${locale}/projects/${project.slug}/edit`}
                                    className="flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 transition-colors shadow-md shadow-primary-600/20"
                                >
                                    {locale === "ar" ? "تعديل المشروع" : "Edit Project"}
                                </Link>
                            ) : (
                                <button className="flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 transition-colors shadow-md shadow-primary-600/20">
                                    {locale === "ar" ? "ساهم الآن" : "Contribute Now"}
                                </button>
                            )}
                            <div className="flex gap-2">
                                <button className="flex items-center gap-2 px-4 py-2.5 border border-secondary-200 rounded-xl bg-white hover:bg-secondary-50 transition-colors text-sm font-medium text-secondary-700">
                                    <Star className="w-4 h-4" />
                                    {locale === "ar" ? "تفضيل" : "Star"}
                                </button>
                                <button className="flex items-center gap-2 px-4 py-2.5 border border-secondary-200 rounded-xl bg-white hover:bg-secondary-50 transition-colors text-sm font-medium text-secondary-700">
                                    <Share2 className="w-4 h-4" />
                                    {locale === "ar" ? "مشاركة" : "Share"}
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
                            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                            <div>
                                <h3 className="font-bold text-amber-800 mb-1">
                                    {locale === "ar" ? "ملاحظات الإدارة" : "Admin Feedback"}
                                </h3>
                                <p className="text-sm text-amber-700">
                                    {locale === "ar"
                                        ? "قدّم المسؤول الملاحظات التالية على طلب نشر مشروعك:"
                                        : "The admin has provided the following feedback on your project submission:"}
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
                        {/* Sadaqah Jariyah Impact */}
                        {project.impact && (
                            <div className="rounded-2xl p-6 bg-gradient-to-br from-primary-600 to-primary-800 text-white relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -mr-10 -mt-10"></div>
                                <div className="relative z-10">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Heart className="w-5 h-5 text-accent-400" fill="currentColor" />
                                        <h2 className="text-lg font-bold">
                                            {locale === "ar" ? "أثر الصدقة الجارية" : "Sadaqah Jariyah Impact"}
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
                                {locale === "ar" ? "حول هذا المشروع" : "About this Project"}
                            </h2>
                            <div className="prose prose-secondary max-w-none">
                                <p className="text-secondary-700 whitespace-pre-wrap leading-relaxed">{project.description}</p>
                            </div>
                        </div>

                        {/* Required Skills */}
                        <div className="bg-white rounded-2xl border border-waqf-border p-6">
                            <h2 className="text-lg font-bold text-secondary-900 mb-4">
                                {locale === "ar" ? "المهارات المطلوبة" : "Required Skills"}
                            </h2>

                            {requiredSkills.length > 0 && (
                                <div className="mb-5">
                                    <p className="text-sm font-medium text-secondary-500 mb-3">
                                        {locale === "ar" ? "مطلوبة" : "Required"}
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
                                        {locale === "ar" ? "يفضل وجودها" : "Nice to have"}
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
                                {locale === "ar" ? "خارطة الطريق" : "Project Roadmap"}
                            </h2>
                            <div className="space-y-4">
                                {[
                                    { label: locale === "ar" ? "إعداد البنية التحتية" : "Set up project infrastructure", done: true },
                                    { label: locale === "ar" ? "التصميم الأولي" : "Initial API design & documentation", done: true },
                                    { label: locale === "ar" ? "التطوير الأساسي" : "Core feature development", done: false },
                                    { label: locale === "ar" ? "الاختبار والنشر" : "Testing & deployment", done: false },
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        {item.done ? (
                                            <CheckCircle className="w-5 h-5 text-primary-600 shrink-0" />
                                        ) : (
                                            <Circle className="w-5 h-5 text-secondary-300 shrink-0" />
                                        )}
                                        <span className={`text-sm ${item.done ? "text-secondary-900 font-medium" : "text-secondary-500"}`}>
                                            {item.label}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div className="bg-white rounded-2xl border border-waqf-border p-6">
                            <h2 className="text-lg font-bold text-secondary-900 mb-4">
                                {locale === "ar" ? "النشاط الأخير" : "Recent Activity"}
                            </h2>
                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0 mt-0.5">
                                        <GitPullRequest className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-secondary-900">
                                            <span className="font-medium">{locale === "ar" ? "تم دمج PR #42:" : "PR #42 merged:"}</span>{" "}
                                            {locale === "ar" ? "إضافة دعم البحث" : "Add search functionality"}
                                        </p>
                                        <p className="text-xs text-secondary-400 mt-1">
                                            {locale === "ar" ? "منذ يومين" : "2 days ago"}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                                        <AlertCircle className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-secondary-900">
                                            <span className="font-medium">{locale === "ar" ? "Issue #15:" : "Issue #15:"}</span>{" "}
                                            {locale === "ar" ? "تحسين أداء الاستعلامات" : "Improve query performance"}
                                        </p>
                                        <p className="text-xs text-secondary-400 mt-1">
                                            {locale === "ar" ? "منذ 5 أيام" : "5 days ago"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar (4 cols) */}
                    <div className="lg:col-span-4 space-y-6">
                        {/* Status Workflow (owner only) */}
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
                                {locale === "ar" ? "تفاصيل المشروع" : "Project Details"}
                            </h3>
                            <dl className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <dt className="text-secondary-500 flex items-center gap-1.5">
                                        <Calendar className="w-4 h-4" />
                                        {locale === "ar" ? "تاريخ الإنشاء" : "Created"}
                                    </dt>
                                    <dd className="font-medium text-secondary-900">
                                        {new Date(project.createdAt).toLocaleDateString(locale === "ar" ? "ar-SA" : "en-US", {
                                            year: "numeric",
                                            month: "short",
                                        })}
                                    </dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-secondary-500 flex items-center gap-1.5">
                                        <Users className="w-4 h-4" />
                                        {locale === "ar" ? "المتقدمين" : "Applicants"}
                                    </dt>
                                    <dd className="font-medium text-secondary-900">{project._count.applications}</dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-secondary-500 flex items-center gap-1.5">
                                        <Eye className="w-4 h-4" />
                                        {locale === "ar" ? "المشاهدات" : "Views"}
                                    </dt>
                                    <dd className="font-medium text-secondary-900">{project.viewCount}</dd>
                                </div>
                                {project.timeCommitment && (
                                    <div className="flex justify-between">
                                        <dt className="text-secondary-500 flex items-center gap-1.5">
                                            <Clock className="w-4 h-4" />
                                            {locale === "ar" ? "الالتزام" : "Commitment"}
                                        </dt>
                                        <dd className="font-medium text-secondary-900">{project.timeCommitment}</dd>
                                    </div>
                                )}
                            </dl>
                        </div>

                        {/* Tech Stack */}
                        <div className="bg-white rounded-2xl border border-waqf-border p-6">
                            <h3 className="text-sm font-semibold text-secondary-900 mb-3">
                                {locale === "ar" ? "التقنيات" : "Tech Stack"}
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

                        {/* Repository / Docs Links */}
                        <div className="bg-white rounded-2xl border border-waqf-border p-6">
                            <h3 className="text-sm font-semibold text-secondary-900 mb-3">
                                {locale === "ar" ? "الروابط" : "Links"}
                            </h3>
                            <div className="space-y-2">
                                {project.githubUrl && (
                                    <a
                                        href={project.githubUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-3 p-3 rounded-xl border border-secondary-200 hover:border-primary-600/40 hover:bg-primary-50/50 transition-all group"
                                    >
                                        <Github className="w-5 h-5 text-secondary-500 group-hover:text-primary-600" />
                                        <span className="text-sm font-medium text-secondary-700 group-hover:text-primary-600">
                                            {locale === "ar" ? "عرض المستودع" : "View Repository"}
                                        </span>
                                        <ExternalLink className="w-3.5 h-3.5 text-secondary-400 ml-auto" />
                                    </a>
                                )}
                            </div>
                        </div>

                        {/* Creator Profile */}
                        <div className="bg-white rounded-2xl border border-waqf-border p-6">
                            <h3 className="text-sm font-semibold text-secondary-900 mb-4">
                                {locale === "ar" ? "منشئ المشروع" : "Project Creator"}
                            </h3>
                            <Link
                                href={`/${locale}/profile/${project.owner.id}`}
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
                                        {locale === "ar" ? "الملف الشخصي" : "View Profile"}
                                    </p>
                                </div>
                            </Link>
                            <button className="w-full px-4 py-2.5 border border-secondary-200 rounded-xl text-sm font-medium text-secondary-700 hover:bg-secondary-50 transition-colors">
                                {locale === "ar" ? "تواصل مع المنشئ" : "Contact Creator"}
                            </button>
                        </div>

                        {/* Similar Projects (dynamic) */}
                        <SimilarProjects projectId={project.id} locale={locale} />
                    </div>
                </div>
            </div>
        </div>
    );
}
