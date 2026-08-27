import { SquareArrowOutUpRight, ExternalLink } from "lucide-react";
import { SiGithub } from "@icons-pack/react-simple-icons";
import { OpenSourceBadge } from "./OpenSourceBadge";
import { ShowcasePreview, type ToolPreviewItem } from "./ShowcasePreview";
import { ContributionOpportunities } from "./ContributionOpportunities";
import type { GitHubRepoInfo, GitHubIssue } from "@/lib/github/repo";

export interface ShowcaseProjectData {
    title: string;
    slug: string;
    description: string;
    category: string;
    githubUrl: string | null;
    websiteUrl: string | null;
    externalUrl: string | null;
    isOpenSource: boolean;
    screenshots: string[];
    toolsPreview: unknown;
    featuredImage: string | null;
    skills: Array<{ skill: { name: string; nameAr: string | null } }>;
}

interface ProjectShowcaseSectionProps {
    project: ShowcaseProjectData;
    locale: string;
    repoInfo: GitHubRepoInfo | null;
    issues: GitHubIssue[] | null;
}

/**
 * Generic showcase section for any open-source / showcase-enabled project.
 *
 * Intended as the dedicated Toolkit page content, but reused for any
 * future project (Quran app, Islamic dataset, mosque software, ...).
 * The Toolkit is simply the first project using these generic capabilities.
 *
 * Architectural boundary: consumes public metadata (websiteUrl, githubUrl,
 * repoInfo, issues) — never imports Toolkit runtime components.
 */
export function ProjectShowcaseSection({ project, locale, repoInfo, issues }: ProjectShowcaseSectionProps) {
    const isAr = locale === "ar";
    const liveUrl = project.websiteUrl || project.externalUrl;
    const repoUrl = project.githubUrl;

    const shouldShow =
        project.isOpenSource || !!repoUrl || !!liveUrl || project.screenshots.length > 0;

    if (!shouldShow) return null;

    // Normalize toolsPreview from Json — array of {label, labelAr, ...} or null
    let toolsPreview: ToolPreviewItem[] | null = null;
    if (Array.isArray(project.toolsPreview)) {
        toolsPreview = (project.toolsPreview as ToolPreviewItem[]).filter(
            (t) => t && typeof t.label === "string" && t.label.trim()
        );
    }

    const fallbackTools = project.skills.map((s) => s.skill);

    // Determine contribution URL: GitHub issues page or fallback
    const contributeUrl = repoUrl ? `${repoUrl.replace(/\/$/, "")}/issues` : liveUrl ?? `/${locale}/projects/${project.slug}`;
    const exploreUrl = liveUrl ?? repoUrl ?? `/${locale}/projects/${project.slug}`;

    const exploreLabel = isAr ? "استكشاف" : "Explore";
    const contributeLabel = isAr ? "ساهم" : "Contribute";

    return (
        <section className="overflow-hidden rounded-lg border border-waqf-border bg-white">
            {/* Header */}
            <div className="border-b border-waqf-border p-6 md:p-8">
                <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-xl font-bold tracking-tight text-secondary-900 md:text-2xl">
                        {project.title}
                    </h2>
                    {(project.isOpenSource || !!repoUrl) && <OpenSourceBadge locale={locale} />}
                </div>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-secondary-600 md:text-[15px]">
                    {project.description.slice(0, 280)}
                </p>

                {/* Tech stack */}
                {project.skills.length > 0 && (
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                        <span className="text-xs font-semibold text-secondary-500">
                            {isAr ? "التقنيات:" : "Stack:"}
                        </span>
                        {project.skills.slice(0, 6).map((ps) => (
                            <span
                                key={ps.skill.name}
                                className="rounded-full border border-waqf-border bg-secondary-50 px-2.5 py-1 text-xs font-medium text-secondary-700"
                            >
                                {locale === "ar" ? ps.skill.nameAr || ps.skill.name : ps.skill.name}
                            </span>
                        ))}
                    </div>
                )}

                {/* Repo stats */}
                {repoInfo && (
                    <div className="mt-4 flex flex-wrap gap-4 text-xs tabular-nums text-secondary-500">
                        <span className="inline-flex items-center gap-1.5">
                            <SiGithub className="h-3.5 w-3.5" />
                            ★ {repoInfo.stars.toLocaleString(isAr ? "ar-SA" : "en-US")}
                        </span>
                        <span>⑂ {repoInfo.forks.toLocaleString(isAr ? "ar-SA" : "en-US")} forks</span>
                        <span>{repoInfo.openIssues} {isAr ? "قضية مفتوحة" : "open issues"}</span>
                        {repoInfo.language && <span>{repoInfo.language}</span>}
                    </div>
                )}

                {/* CTAs */}
                <div className="mt-6 flex flex-wrap gap-3">
                    <a
                        href={exploreUrl}
                        target={liveUrl || repoUrl ? "_blank" : undefined}
                        rel={liveUrl || repoUrl ? "noopener noreferrer" : undefined}
                        className="inline-flex items-center justify-center gap-2 rounded-md bg-primary-600 px-6 h-11 text-sm font-semibold text-white hover:bg-primary-700 transition-colors"
                    >
                        {exploreLabel}
                        <SquareArrowOutUpRight className="h-4 w-4" />
                    </a>
                    <a
                        href={contributeUrl}
                        target={repoUrl ? "_blank" : undefined}
                        rel={repoUrl ? "noopener noreferrer" : undefined}
                        className="inline-flex items-center justify-center gap-2 rounded-md border border-waqf-border bg-white px-6 h-11 text-sm font-semibold text-secondary-700 hover:bg-secondary-50 transition-colors"
                    >
                        <SiGithub className="h-4 w-4" />
                        {contributeLabel}
                    </a>
                </div>

                {/* External links row */}
                <div className="mt-4 flex flex-wrap gap-4 text-sm">
                    {liveUrl && (
                        <a
                            href={liveUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 font-medium text-secondary-600 hover:text-primary-600 hover:underline underline-offset-4"
                        >
                            <ExternalLink className="h-3.5 w-3.5" />
                            {isAr ? "الموقع المباشر" : "Live website"}
                        </a>
                    )}
                    {repoUrl && (
                        <a
                            href={repoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 font-medium text-secondary-600 hover:text-primary-600 hover:underline underline-offset-4"
                        >
                            <SiGithub className="h-4 w-4" />
                            GitHub
                        </a>
                    )}
                </div>
            </div>

            {/* Preview */}
            <div className="p-6 md:p-8">
                <h3 className="mb-4 text-sm font-bold tracking-tight text-secondary-900">
                    {isAr ? "معاينة" : "Preview"}
                </h3>
                <ShowcasePreview
                    screenshots={project.screenshots}
                    toolsPreview={toolsPreview}
                    projectTitle={project.title}
                    locale={locale}
                    fallbackTools={fallbackTools}
                />
                <p className="mt-3 text-xs leading-relaxed text-secondary-400">
                    {isAr
                        ? "معاينة للمعلومات فقط — يتم تشغيل الأدوات في موقع المشروع المستقل."
                        : "Preview only — utilities run on the project's independent deployment."}
                </p>
            </div>

            {/* Contribution opportunities */}
            {repoUrl && (
                <div className="border-t border-waqf-border bg-waqf-bg p-6 md:p-8">
                    <ContributionOpportunities issues={issues} repoUrl={repoUrl} locale={locale} />
                </div>
            )}
        </section>
    );
}
