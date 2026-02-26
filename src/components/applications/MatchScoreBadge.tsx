"use client";

import { useTranslations } from "next-intl";

interface MatchScoreBadgeProps {
    score: number;
    breakdown?: {
        skillScore: number;
        categoryScore: number;
        languageScore: number;
        recencyScore: number;
    };
    compact?: boolean;
}

function getScoreColor(score: number) {
    if (score >= 70) return { ring: "text-green-500", bg: "bg-green-50", text: "text-green-700" };
    if (score >= 40) return { ring: "text-amber-500", bg: "bg-amber-50", text: "text-amber-700" };
    return { ring: "text-red-400", bg: "bg-red-50", text: "text-red-600" };
}

export function MatchScoreBadge({ score, breakdown, compact }: MatchScoreBadgeProps) {
    const t = useTranslations("applications");
    const colors = getScoreColor(score);
    const circumference = 2 * Math.PI * 18;
    const dashOffset = circumference - (score / 100) * circumference;

    if (compact) {
        return (
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-bold ${colors.bg} ${colors.text}`}>
                {Math.round(score)}%
            </span>
        );
    }

    return (
        <div className="flex flex-col items-center gap-2">
            {/* Circular progress */}
            <div className="relative w-14 h-14">
                <svg className="w-14 h-14 -rotate-90" viewBox="0 0 40 40">
                    <circle
                        cx="20" cy="20" r="18"
                        fill="none"
                        strokeWidth="3"
                        className="stroke-secondary-100"
                    />
                    <circle
                        cx="20" cy="20" r="18"
                        fill="none"
                        strokeWidth="3"
                        strokeDasharray={circumference}
                        strokeDashoffset={dashOffset}
                        strokeLinecap="round"
                        className={`${colors.ring} stroke-current transition-all duration-500`}
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className={`text-xs font-bold ${colors.text}`}>{Math.round(score)}</span>
                </div>
            </div>
            <span className="text-[10px] font-medium text-secondary-500">{t("matchScore")}</span>

            {/* Breakdown tooltip */}
            {breakdown && (
                <div className="w-full space-y-1.5 mt-1">
                    <BreakdownBar label={t("skillMatch")} value={breakdown.skillScore} max={70} />
                    <BreakdownBar label={t("categoryMatch")} value={breakdown.categoryScore} max={15} />
                    <BreakdownBar label={t("languageMatch")} value={breakdown.languageScore} max={10} />
                    <BreakdownBar label={t("recencyScore")} value={breakdown.recencyScore} max={5} />
                </div>
            )}
        </div>
    );
}

function BreakdownBar({ label, value, max }: { label: string; value: number; max: number }) {
    const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
    return (
        <div className="flex items-center gap-2">
            <span className="text-[10px] text-secondary-400 w-16 truncate">{label}</span>
            <div className="flex-1 h-1.5 bg-secondary-100 rounded-full overflow-hidden">
                <div
                    className="h-full bg-primary-500 rounded-full transition-all"
                    style={{ width: `${pct}%` }}
                />
            </div>
            <span className="text-[10px] font-medium text-secondary-500 w-6 text-right">{Math.round(value)}</span>
        </div>
    );
}
