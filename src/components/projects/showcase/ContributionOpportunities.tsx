import { ExternalLink, Tag, MessageCircle } from "lucide-react";
import type { GitHubIssue } from "@/lib/github/repo";

interface ContributionOpportunitiesProps {
    issues: GitHubIssue[] | null;
    repoUrl: string;
    locale: string;
}

export function ContributionOpportunities({ issues, repoUrl, locale }: ContributionOpportunitiesProps) {
    const isAr = locale === "ar";

    if (!issues || issues.length === 0) {
        return (
            <div className="rounded-lg border border-waqf-border bg-white p-6">
                <h3 className="text-sm font-bold tracking-tight text-secondary-900">
                    {isAr ? "فرص المساهمة" : "Contribution opportunities"}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-secondary-500">
                    {isAr
                        ? "لا توجد قضايا مفتوحة حالياً. تابع المستودع للمزيد."
                        : "No open issues right now. Watch the repository for upcoming opportunities."}
                </p>
                {repoUrl && (
                    <a
                        href={`${repoUrl.replace(/\/$/, "")}/issues`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary-600 hover:underline underline-offset-4"
                    >
                        {isAr ? "عرض القضايا على GitHub" : "View issues on GitHub"}
                        <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                )}
            </div>
        );
    }

    return (
        <div className="rounded-lg border border-waqf-border bg-white p-6">
            <div className="flex items-center justify-between gap-4">
                <h3 className="text-sm font-bold tracking-tight text-secondary-900">
                    {isAr ? "فرص المساهمة" : "Contribution opportunities"}
                </h3>
                <span className="shrink-0 rounded-full bg-primary-50 px-2.5 py-1 text-xs font-semibold tabular-nums text-primary-700">
                    {issues.length} {isAr ? "مفتوحة" : "open"}
                </span>
            </div>

            <ul className="mt-4 divide-y divide-waqf-border rounded-lg border border-waqf-border">
                {issues.slice(0, 7).map((issue) => (
                    <li key={issue.number} className="group">
                        <a
                            href={issue.htmlUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-start justify-between gap-3 p-3 hover:bg-primary-50/50 transition-colors"
                        >
                            <div className="min-w-0 flex-1">
                                <p className="flex items-center gap-2 text-sm font-medium leading-tight text-secondary-900 group-hover:text-primary-700">
                                    <span className="font-mono text-xs text-secondary-400">#{issue.number}</span>
                                    <span className="truncate">{issue.title}</span>
                                    <ExternalLink className="h-3 w-3 shrink-0 text-secondary-400 group-hover:text-primary-600" />
                                </p>
                                <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                                    {issue.labels.slice(0, 3).map((label) => {
                                        const goodFirst = /good first issue/i.test(label.name);
                                        const helpWanted = /help wanted/i.test(label.name);
                                        const tone = goodFirst
                                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                            : helpWanted
                                              ? "bg-accent-50 text-accent-700 border-accent-200"
                                              : "bg-secondary-50 text-secondary-600 border-waqf-border";
                                        return (
                                            <span
                                                key={label.name}
                                                className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium ${tone}`}
                                                title={label.name}
                                            >
                                                <Tag className="h-3 w-3" />
                                                {label.name}
                                            </span>
                                        );
                                    })}
                                    {issue.labels.length > 3 && (
                                        <span className="text-[11px] text-secondary-400">
                                            +{issue.labels.length - 3}
                                        </span>
                                    )}
                                    {issue.comments > 0 && (
                                        <span className="inline-flex items-center gap-1 text-[11px] text-secondary-500">
                                            <MessageCircle className="h-3 w-3" />
                                            {issue.comments}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </a>
                    </li>
                ))}
            </ul>

            <div className="mt-4 flex flex-wrap gap-3">
                <a
                    href={`${repoUrl.replace(/\/$/, "")}/issues`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-600 hover:underline underline-offset-4"
                >
                    {isAr ? "عرض جميع القضايا" : "View all issues"}
                    <ExternalLink className="h-3.5 w-3.5" />
                </a>
                <span className="text-sm text-secondary-300">·</span>
                <a
                    href={`${repoUrl.replace(/\/$/, "")}/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-secondary-600 hover:text-primary-600 hover:underline underline-offset-4"
                >
                    {isAr ? "مبتدئ" : "good first issue"}
                </a>
            </div>
        </div>
    );
}
