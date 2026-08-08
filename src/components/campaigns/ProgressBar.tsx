"use client";

import { useTranslations } from "next-intl";

export interface ProgressBarProps {
    filled: number;
    total: number;
    label?: string;
    showCount?: boolean;
    className?: string;
}

export function ProgressBar({ filled, total, label, showCount = true, className = "" }: ProgressBarProps) {
    const pct = total > 0 ? Math.min(100, Math.round((filled / total) * 100)) : 0;
    const full = total > 0 && filled >= total;

    return (
        <div className={className}>
            {(label || showCount) && (
                <div className="flex items-center justify-between text-xs text-secondary-600 mb-1.5">
                    {label && <span>{label}</span>}
                    {showCount && (
                        <span className="font-medium text-secondary-700">
                            {filled}/{total}
                        </span>
                    )}
                </div>
            )}
            <div className="h-2 w-full rounded-full bg-secondary-100 overflow-hidden">
                <div
                    className={`h-full transition-all duration-500 ${
                        full ? "bg-primary-600" : "bg-primary-500"
                    }`}
                    style={{ width: `${pct}%` }}
                />
            </div>
        </div>
    );
}

export function CampaignOverallProgress({ percent }: { percent: number }) {
    const t = useTranslations("campaigns");
    const safePct = Math.max(0, Math.min(100, Math.round(percent ?? 0)));
    return (
        <div className="flex items-center gap-2">
            <div className="h-1.5 flex-1 rounded-full bg-secondary-100 overflow-hidden">
                <div
                    className="h-full bg-gradient-to-r from-primary-500 to-accent-500 transition-all duration-500"
                    style={{ width: `${safePct}%` }}
                />
            </div>
            <span className="text-xs font-semibold text-secondary-600 w-9 text-right tabular-nums">
                {safePct}%
            </span>
            <span className="sr-only">{t("detail.rolesHeading")}</span>
        </div>
    );
}
