"use client";

import { GitPullRequest, CheckCircle, Clock } from "lucide-react";

interface WaqfTimelineProps {
    locale?: string;
}

const timelineItems = [
    {
        project: "OpenQuran API",
        projectAr: "واجهة القرآن المفتوح",
        date: "Oct 2024",
        dateAr: "أكتوبر ٢٠٢٤",
        description: "Added full-text search for Arabic ayahs",
        descriptionAr: "إضافة البحث النصي الكامل للآيات العربية",
        hours: 12,
        status: "merged" as const,
        color: "bg-primary-600",
    },
    {
        project: "Salah Time Calculator",
        projectAr: "حاسبة أوقات الصلاة",
        date: "Sep 2024",
        dateAr: "سبتمبر ٢٠٢٤",
        description: "Implemented Hanafi calculation method",
        descriptionAr: "تطبيق طريقة الحساب الحنفي",
        hours: 8,
        status: "merged" as const,
        color: "bg-accent-500",
    },
    {
        project: "Zakat Dashboard",
        projectAr: "لوحة الزكاة",
        date: "Aug 2024",
        dateAr: "أغسطس ٢٠٢٤",
        description: "Fixed wealth threshold calculation for gold",
        descriptionAr: "إصلاح حساب نصاب الذهب",
        hours: 4,
        status: "in-progress" as const,
        color: "bg-blue-500",
    },
];

export function WaqfTimeline({ locale = "en" }: WaqfTimelineProps) {
    return (
        <div className="bg-white rounded-2xl border border-waqf-border p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-secondary-900">
                    {locale === "ar" ? "تاريخ الوقف" : "Waqf History"}
                </h3>
                <button className="text-sm font-medium text-primary-600 hover:text-primary-700">
                    {locale === "ar" ? "عرض الكل" : "View Full History"}
                </button>
            </div>

            <div className="relative">
                {/* Vertical Line */}
                <div className="absolute left-[15px] top-0 bottom-0 w-0.5 bg-secondary-100"></div>

                <div className="space-y-6">
                    {timelineItems.map((item, i) => (
                        <div key={i} className="relative flex gap-4 pl-10">
                            {/* Circle Node */}
                            <div className={`absolute left-0 top-1 w-[30px] h-[30px] rounded-full ${item.color} flex items-center justify-center text-white shadow-sm`}>
                                {item.status === "merged" ? (
                                    <GitPullRequest className="w-3.5 h-3.5" />
                                ) : (
                                    <Clock className="w-3.5 h-3.5" />
                                )}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                    <h4 className="text-sm font-bold text-secondary-900">
                                        {locale === "ar" ? item.projectAr : item.project}
                                    </h4>
                                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-secondary-100 text-secondary-500">
                                        {locale === "ar" ? item.dateAr : item.date}
                                    </span>
                                </div>
                                <p className="text-sm text-secondary-600 mb-2">
                                    {locale === "ar" ? item.descriptionAr : item.description}
                                </p>
                                <div className="flex items-center gap-3 text-xs text-secondary-400">
                                    <span className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {item.hours} {locale === "ar" ? "ساعة" : "hours"}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        {item.status === "merged" ? (
                                            <>
                                                <CheckCircle className="w-3 h-3 text-primary-600" />
                                                <span className="text-primary-600 font-medium">
                                                    {locale === "ar" ? "تم الدمج" : "Merged"}
                                                </span>
                                            </>
                                        ) : (
                                            <>
                                                <Clock className="w-3 h-3 text-accent-600" />
                                                <span className="text-accent-600 font-medium">
                                                    {locale === "ar" ? "قيد التنفيذ" : "In Progress"}
                                                </span>
                                            </>
                                        )}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
