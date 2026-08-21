"use client";

import { useMemo } from "react";

interface ContributionHeatmapProps {
    locale?: string;
    /** ISO date strings of real contribution events (accepted applications, joins). */
    dates: string[];
}

const WEEKS = 52;

export function ContributionHeatmap({ locale = "en", dates }: ContributionHeatmapProps) {
    const { heatmapData, total } = useMemo(() => {
        const counts = new Map<string, number>();
        for (const d of dates) {
            const key = new Date(d).toISOString().slice(0, 10);
            counts.set(key, (counts.get(key) ?? 0) + 1);
        }

        // Build a 52x7 grid ending this week, aligned so the last column ends today.
        const today = new Date();
        const end = new Date(today);
        end.setDate(end.getDate() + (6 - ((end.getDay() + 6) % 7))); // upcoming Sunday
        const data: number[][] = [];
        for (let w = WEEKS - 1; w >= 0; w--) {
            const week: number[] = [];
            for (let d = 0; d < 7; d++) {
                const day = new Date(end);
                day.setDate(day.getDate() - (w * 7 + d));
                const key = day.toISOString().slice(0, 10);
                const c = counts.get(key) ?? 0;
                week.push(c === 0 ? 0 : c <= 2 ? 1 : c <= 4 ? 2 : c <= 8 ? 3 : 4);
            }
            data.push(week);
        }
        return { heatmapData: data, total: dates.length };
    }, [dates]);

    if (total === 0) return null;

    const getColor = (level: number): string => {
        switch (level) {
            case 0: return "bg-secondary-100";
            case 1: return "bg-primary-200";
            case 2: return "bg-primary-400";
            case 3: return "bg-primary-600";
            case 4: return "bg-primary-800";
            default: return "bg-secondary-100";
        }
    };

    const months = locale === "ar"
        ? ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"]
        : ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    return (
        <div className="bg-white rounded-lg border border-waqf-border p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-secondary-900">
                    {locale === "ar" ? "نشاط المساهمة" : "Contribution Activity"}
                </h3>
                <span className="text-xs tabular-nums text-secondary-500">
                    {total} {locale === "ar" ? "مساهمة في السنة الماضية" : "contributions in the last year"}
                </span>
            </div>

            {/* Month labels */}
            <div className="flex mb-1 text-[10px] text-secondary-400 pl-8">
                {months.map((m, i) => (
                    <span key={i} className="flex-1 text-center">{m}</span>
                ))}
            </div>

            {/* Heatmap Grid */}
            <div className="flex gap-[2px] overflow-hidden">
                {/* Day labels */}
                <div className="flex flex-col gap-[2px] pr-1 text-[10px] text-secondary-400 justify-between">
                    <span className="h-[10px]"></span>
                    <span className="h-[10px] leading-[10px]">{locale === "ar" ? "اثن" : "Mon"}</span>
                    <span className="h-[10px]"></span>
                    <span className="h-[10px] leading-[10px]">{locale === "ar" ? "أرب" : "Wed"}</span>
                    <span className="h-[10px]"></span>
                    <span className="h-[10px] leading-[10px]">{locale === "ar" ? "جمع" : "Fri"}</span>
                    <span className="h-[10px]"></span>
                </div>

                {/* Grid */}
                {heatmapData.map((week, wi) => (
                    <div key={wi} className="flex flex-col gap-[2px]">
                        {week.map((level, di) => (
                            <div
                                key={`${wi}-${di}`}
                                className={`w-[10px] h-[10px] rounded-[2px] ${getColor(level)}`}
                            />
                        ))}
                    </div>
                ))}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-2 mt-4 text-[10px] text-secondary-400">
                <span>{locale === "ar" ? "أقل" : "Less"}</span>
                {[0, 1, 2, 3, 4].map((level) => (
                    <div key={level} className={`w-[10px] h-[10px] rounded-[2px] ${getColor(level)}`} />
                ))}
                <span>{locale === "ar" ? "أكثر" : "More"}</span>
            </div>
        </div>
    );
}
