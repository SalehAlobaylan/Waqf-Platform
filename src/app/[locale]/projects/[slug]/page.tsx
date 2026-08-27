import { notFound } from "next/navigation";
import Link from "next/link";
import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import {
    Heart, Star, Share2, SquareArrowOutUpRight,
    Calendar, Users, Clock,
    ChevronRight, CircleAlert, Eye
} from "lucide-react";
import { SiGithub } from "@icons-pack/react-simple-icons";
import { ViewTracker } from "@/components/projects/ViewTracker";
import { SimilarProjects } from "@/components/projects/SimilarProjects";
import { StatusWorkflow } from "@/components/projects/StatusWorkflow";
import { ReportButton } from "@/components/reports/ReportButton";
import { ApplyButton } from "@/components/applications/ApplyButton";
import { StatusBadge } from "@/components/ui/Badge";
import { getCategoryLabel, getCategoryTint } from "@/lib/categories";
import { cn } from "@/lib/utils";
import { OpenSourceBadge } from "@/components/projects/showcase/OpenSourceBadge";
import { ProjectShowcaseSection } from "@/components/projects/showcase/ProjectShowcaseSection";
import { parseGitHubRepoUrl, fetchGitHubRepoInfo, fetchGitHubIssues } from "@/lib/github/repo";

interface ProjectPageProps {
    params: Promise<{ locale: string; slug: string }>;
}

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
    const tint = getCategoryTint(project.category);

    // Generic open-source showcase: fetch public GitHub metadata without coupling to Toolkit runtime
    // Gracefully degrades to null if repo unavailable — Waqf remains fully functional.
    const parsedRepo = parseGitHubRepoUrl(project.githubUrl);
    let repoInfo: Awaited<ReturnType<typeof fetchGitHubRepoInfo>> = null;
    let issues: Awaited<ReturnType<typeof fetchGitHubIssues>> = null;
    if (parsedRepo) {
        try {
            const [info, issueList] = await Promise.all([
                fetchGitHubRepoInfo(parsedRepo.owner, parsedRepo.repo).catch(() => null),
                fetchGitHubIssues(parsedRepo.owner, parsedRepo.repo, { perPage: 7 }).catch(() => null),
            ]);
            repoInfo = info;
            issues = issueList;
        } catch {
            // Graceful degradation — showcase renders without GitHub live data
        }
    }

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
                    <span>{getCategoryLabel(project.category, locale)}</span>
                    <ChevronRight className="w-3.5 h-3.5 rtl:rotate-180" />
                    <span className="text-secondary-900 font-medium truncate max-w-[200px]">{project.title}</span>
                </nav>
            </div>

            {/* Featured Image */}
            {project.featuredImage && (
                <div className="max-w-[1280px] mx-auto px-6 pt-4">
                    <div className="rounded-lg overflow-hidden border border-waqf-border">
                        <img src={project.featuredImage} alt={project.title} className="w-full h-64 md:h-80 object-cover" />
                    </div>
                </div>
            )}

            {/* External / Curated Banner */}
            {isExternal && project.externalUrl && (
                <div className="max-w-[1280px] mx-auto px-6 pt-4">
                    <div className="rounded-lg border border-accent-200 bg-accent-50/60 p-6 md:p-8">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div className="flex-1">
                                <p className="text-xs font-semibold text-accent-700 mb-2">
                                    {t("curatedByWaqf")}
                                </p>
                                <h2 className="text-xl md:text-2xl font-bold tracking-tight text-secondary-900 mb-1">
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
                                    className="inline-flex items-center justify-center gap-2 px-6 h-12 bg-primary-600 text-white font-semibold rounded-md hover:bg-primary-700 transition-colors"
                                >
                                    {t("visitProject")}
                                    <SquareArrowOutUpRight className="w-4 h-4" />
                                </a>
                                {project.externalOwnerContact && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(project.externalOwnerContact) && (
                                    <a
                                        href={`mailto:${project.externalOwnerContact}`}
                                        className="inline-flex items-center justify-center gap-2 px-5 h-12 bg-white border border-waqf-border text-secondary-700 font-semibold rounded-md hover:bg-secondary-50 transition-colors"
                                    >
                                        {t("contactOwner")}
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Editorial header */}
            <header className="max-w-[1280px] mx-auto px-6 pt-8 pb-8 border-b border-waqf-border">
                <div className="flex flex-wrap items-center gap-3 mb-4">
                    <StatusBadge status={project.status} locale={locale} />
                    <span className={cn("rounded px-1.5 py-0.5 text-xs font-semibold", tint.bg, tint.text)}>
                        {getCategoryLabel(project.category, locale)}
                    </span>
                    {(project.isOpenSource || project.githubUrl) && (
                        <OpenSourceBadge locale={locale} />
                    )}
                    {project.status === "OPEN" && !isExternal && (
                        <span className="text-xs font-semibold text-primary-600 flex items-center gap-1.5">
                            <Heart className="w-3.5 h-3.5" fill="currentColor" />
                            {t("helpWanted")}
                        </span>
                    )}
                </div>
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                    <div className="max-w-2xl">
                        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-secondary-900 mb-3">
                            {project.title}
                        </h1>
                        <p className="text-secondary-500 leading-relaxed">
                            {project.description?.slice(0, 220)}
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-3 shrink-0 items-start">
                        {isExternal && project.externalUrl ? (
                            <a
                                href={project.externalUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-2 px-6 h-12 bg-primary-600 text-white font-semibold rounded-md hover:bg-primary-700 transition-colors"
                            >
                                {t("visitProject")}
                                <SquareArrowOutUpRight className="w-4 h-4" />
                            </a>
                        ) : isOwner ? (
                            <Link
                                href={`/${locale}/projects/${project.slug}/edit`}
                                className="flex items-center justify-center gap-2 px-6 h-12 bg-primary-600 text-white font-semibold rounded-md hover:bg-primary-700 transition-colors"
                            >
                                {t("editProject")}
                            </Link>
                        ) : !session ? (
                            <Link
                                href={`/${locale}/login`}
                                className="flex items-center justify-center gap-2 px-6 h-12 bg-primary-600 text-white font-semibold rounded-md hover:bg-primary-700 transition-colors"
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
                            <button aria-label={t("star")} className="flex items-center gap-2 px-4 h-10 border border-waqf-border rounded-md bg-white hover:bg-secondary-50 transition-colors text-sm font-medium text-secondary-700">
                                <Star className="w-4 h-4" />
                                {t("star")}
                            </button>
                            <button aria-label={t("share")} className="flex items-center gap-2 px-4 h-10 border border-waqf-border rounded-md bg-white hover:bg-secondary-50 transition-colors text-sm font-medium text-secondary-700">
                                <Share2 className="w-4 h-4" />
                                {t("share")}
                            </button>
                        </div>
                        {!isOwner && (
                            <ReportButton targetType="PROJECT" targetId={project.id} />
                        )}
                    </div>
                </div>
            </header>

            {/* Admin Feedback Banner (for project owner) */}
            {isOwner && project.adminFeedback && project.status === "DRAFT" && (
                <div className="max-w-[1280px] mx-auto px-6 pt-6">
                    <div className="p-5 rounded-lg bg-accent-50 border border-accent-200">
                        <div className="flex items-start gap-3">
                            <CircleAlert className="w-5 h-5 text-accent-700 shrink-0 mt-0.5" />
                            <div>
                                <h3 className="font-bold text-accent-800 mb-1">
                                    {t("adminFeedbackTitle")}
                                </h3>
                                <p className="text-sm text-accent-800/80">
                                    {t("adminFeedbackDesc")}
                                </p>
                                <p className="mt-2 text-secondary-800 bg-white rounded-md p-3 text-sm border border-accent-100">{project.adminFeedback}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 8+4 Grid Layout */}
            <div className="max-w-[1280px] mx-auto px-6 py-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    {/* Main Content (8 cols) */}
                    <div className="lg:col-span-8 space-y-10">
                        {/* Project Impact */}
                        {project.impact && (
                            <section className="relative overflow-hidden rounded-lg p-6 md:p-8 bg-primary-950 text-white">
                                <div
                                    aria-hidden
                                    className="absolute inset-0 opacity-[0.06]"
                                    style={{
                                        backgroundImage:
                                            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='72' height='72' viewBox='0 0 72 72'%3E%3Cg fill='none' stroke='%23ffffff' stroke-opacity='0.55' stroke-width='1'%3E%3Crect x='18' y='18' width='36' height='36'/%3E%3Crect x='18' y='18' width='36' height='36' transform='rotate(45 36 36)'/%3E%3C/g%3E%3C/svg%3E\")",
                                    }}
                                />
                                <div className="relative">
                                    <span aria-hidden className="block w-6 h-0.5 bg-accent-500 mb-4" />
                                    <h2 className="text-lg font-bold tracking-tight mb-2 flex items-center gap-2">
                                        <Heart className="w-5 h-5 text-accent-400" fill="currentColor" />
                                        {t("projectImpact")}
                                    </h2>
                                    <p className="text-primary-100 leading-relaxed">{project.impact}</p>
                                </div>
                            </section>
                        )}

                        {/* Generic showcase — preview, stack, CTAs, contribution opportunities */}
                        {/* First consumer is Islamic Digital Toolkit, but component is fully reusable */}
                        {(project.isOpenSource || project.githubUrl || project.websiteUrl || project.screenshots.length > 0 || project.toolsPreview) && (
                            <ProjectShowcaseSection
                                project={{
                                    title: project.title,
                                    slug: project.slug,
                                    description: project.description,
                                    category: project.category,
                                    githubUrl: project.githubUrl,
                                    websiteUrl: project.websiteUrl,
                                    externalUrl: project.externalUrl,
                                    isOpenSource: project.isOpenSource,
                                    screenshots: project.screenshots,
                                    toolsPreview: project.toolsPreview,
                                    featuredImage: project.featuredImage,
                                    skills: project.skills,
                                }}
                                locale={locale}
                                repoInfo={repoInfo}
                                issues={issues}
                            />
                        )}

                        {/* About / README */}
                        <section>
                            <h2 className="text-lg font-bold tracking-tight text-secondary-900 mb-4 pb-3 border-b border-waqf-border">
                                {t("aboutThisProject")}
                            </h2>
                            <p className="text-secondary-700 whitespace-pre-wrap leading-relaxed">{project.description}</p>
                        </section>

                        {/* Skills */}
                        {(requiredSkills.length > 0 || optionalSkills.length > 0) && (
                            <section>
                                <h2 className="text-lg font-bold tracking-tight text-secondary-900 mb-4 pb-3 border-b border-waqf-border">
                                    {t("requiredSkills")}
                                </h2>
                                {requiredSkills.length > 0 && (
                                    <div className="mb-5">
                                        <p className="text-xs font-semibold text-secondary-500 mb-3">
                                            {t("required")}
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            {requiredSkills.map((ps) => (
                                                <span
                                                    key={ps.skillId}
                                                    className="px-2.5 py-1 bg-primary-50 text-primary-700 border border-primary-200 rounded text-sm font-medium"
                                                >
                                                    {locale === "ar" ? ps.skill.nameAr : ps.skill.name}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {optionalSkills.length > 0 && (
                                    <div>
                                        <p className="text-xs font-semibold text-secondary-500 mb-3">
                                            {t("niceToHave")}
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            {optionalSkills.map((ps) => (
                                                <span
                                                    key={ps.skillId}
                                                    className="px-2.5 py-1 bg-secondary-50 text-secondary-600 border border-waqf-border rounded text-sm"
                                                >
                                                    {locale === "ar" ? ps.skill.nameAr : ps.skill.name}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </section>
                        )}
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
                        <div className="bg-white rounded-lg border border-waqf-border p-6 sticky top-[80px]">
                            <h3 className="text-sm font-semibold text-secondary-900 mb-4">
                                {t("details")}
                            </h3>
                            <dl className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <dt className="text-secondary-500 flex items-center gap-1.5">
                                        <Calendar className="w-4 h-4" />
                                        {t("created")}
                                    </dt>
                                    <dd className="font-medium text-secondary-900 tabular-nums">
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
                                            <dd className="font-medium text-secondary-900 tabular-nums">{project._count.applications}</dd>
                                        </div>
                                        <div className="flex justify-between">
                                            <dt className="text-secondary-500 flex items-center gap-1.5">
                                                <Eye className="w-4 h-4" />
                                                {t("views")}
                                            </dt>
                                            <dd className="font-medium text-secondary-900 tabular-nums">{project.viewCount}</dd>
                                        </div>
                                        <div className="flex justify-between">
                                            <dt className="text-secondary-500 flex items-center gap-1.5">
                                                <Clock className="w-4 h-4" />
                                                {t("commitment")}
                                            </dt>
                                            <dd className="font-medium text-secondary-900">{project.timeCommitment}</dd>
                                        </div>
                                    </>
                                )}
                                {isExternal && project.timeCommitment && (
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
                            <div className="bg-white rounded-lg border border-waqf-border p-6">
                                <h3 className="text-sm font-semibold text-secondary-900 mb-3">
                                    {t("techStack")}
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {project.skills.slice(0, 6).map((ps) => (
                                        <span
                                            key={ps.skillId}
                                            className="px-2.5 py-1 bg-secondary-50 text-secondary-700 border border-waqf-border rounded text-xs font-medium"
                                        >
                                            {locale === "ar" ? ps.skill.nameAr : ps.skill.name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Repository / External Link */}
                        {(project.githubUrl || (isExternal && project.externalUrl)) && (
                            <div className="bg-white rounded-lg border border-waqf-border p-6">
                                <h3 className="text-sm font-semibold text-secondary-900 mb-3">
                                    {t("links")}
                                </h3>
                                <div className="space-y-2">
                                    {isExternal && project.externalUrl && (
                                        <a
                                            href={project.externalUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-3 p-3 rounded-md border border-waqf-border hover:border-primary-300 transition-colors group"
                                        >
                                            <SquareArrowOutUpRight className="w-5 h-5 text-secondary-500 group-hover:text-primary-600" />
                                            <span className="text-sm font-medium text-secondary-700 group-hover:text-primary-600">
                                                {t("visitProject")}
                                            </span>
                                        </a>
                                    )}
                                    {!isExternal && project.githubUrl && (
                                        <a
                                            href={project.githubUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-3 p-3 rounded-md border border-waqf-border hover:border-primary-300 transition-colors group"
                                        >
                                            <SiGithub className="w-5 h-5 text-secondary-500 group-hover:text-primary-600" />
                                            <span className="text-sm font-medium text-secondary-700 group-hover:text-primary-600">
                                                {t("viewRepository")}
                                            </span>
                                        </a>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Creator Profile (internal projects only) */}
                        {!isExternal && project.owner && (
                            <div className="bg-white rounded-lg border border-waqf-border p-6">
                                <h3 className="text-sm font-semibold text-secondary-900 mb-4">
                                    {t("projectCreator")}
                                </h3>
                                <Link
                                    href={`/${locale}/profile/${project.owner.username ?? project.owner.id}`}
                                    className="flex items-center gap-3 group"
                                >
                                    <div className="w-12 h-12 rounded-full bg-primary-50 text-primary-700 flex items-center justify-center text-lg font-bold">
                                        {project.owner.name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-secondary-900 group-hover:text-primary-600 transition-colors">
                                            {project.owner.name}
                                        </p>
                                        <p className="text-xs text-secondary-500 underline-offset-4 group-hover:underline">
                                            {t("viewProfile")}
                                        </p>
                                    </div>
                                </Link>
                                {myApplication && (
                                    <Link
                                        href={`/${locale}/dashboard/applications/${myApplication.id}`}
                                        className="mt-4 w-full px-4 py-2.5 border border-waqf-border rounded-md text-sm font-medium text-secondary-700 hover:bg-secondary-50 transition-colors text-center block"
                                    >
                                        {t("contactCreator")}
                                    </Link>
                                )}
                            </div>
                        )}

                        {/* External Project Info (replaces Creator Profile) */}
                        {isExternal && project.externalOwnerName && (
                            <div className="bg-white rounded-lg border border-waqf-border p-6">
                                <h3 className="text-sm font-semibold text-secondary-900 mb-4">
                                    {t("curatedByWaqf")}
                                </h3>
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-accent-50 text-accent-700 flex items-center justify-center text-lg font-bold">
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
