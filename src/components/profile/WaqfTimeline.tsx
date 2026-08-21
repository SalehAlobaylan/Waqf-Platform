"use client";

import { CircleCheck } from "lucide-react";

export interface TimelineEntry {
    project: string;
    date: string;
}

interface WaqfTimelineProps {
    locale?: string;
    entries: TimelineEntry[];
}

export function WaqfTimeline({ locale = "en", entries }: WaqfTimelineProps) {
    if (entries.length === 0) return null;

    return (
        <div className="bg-white rounded-lg border border-waqf-border p-6">
            <h3 className="text-lg font-bold text-secondary-900 mb-6">
                {locale === "ar" ? "تاريخ الوقف" : "Waqf History"}
            </h3>

            <div className="relative">
                {/* Vertical Line */}
                <div className="absolute left-[15px] top-0 bottom-0 w-0.5 bg-waqf-border"></div>

                <div className="space-y-6">
                    {entries.map((item, i) => (
                        <div key={i} className="relative flex gap-4 pl-10">
                            {/* Node */}
                            <div className="absolute left-0 top-1 w-[30px] h-[30px] rounded-full bg-primary-50 text-primary-700 flex items-center justify-center">
                                <CircleCheck className="w-4 h-4" />
                            </div>

                            <div className="flex-1 min-w-0 pt-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <h4 className="text-sm font-bold text-secondary-900">
                                        {item.project}
                                    </h4>
                                    <span className="text-xs tabular-nums text-secondary-400">
                                        {new Date(item.date).toLocaleDateString(
                                            locale === "ar" ? "ar" : "en",
                                            { month: "short", year: "numeric" }
                                        )}
                                    </span>
                                </div>
                                <p className="mt-1 text-sm text-secondary-500">
                                    {locale === "ar" ? "مساهمة مقبولة" : "Accepted contribution"}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
