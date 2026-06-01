"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Calendar, MessageSquare, Clock } from "lucide-react";
import { ApplicationActions } from "./ApplicationActions";
import { MatchScoreBadge } from "./MatchScoreBadge";
import { ApplicationStatusBadge } from "./ApplicationStatus";
import { ApplicationStatus } from "@prisma/client";

interface ApplicationWithScore {
    id: string;
    status: string;
    message: string | null;
    hoursPerWeek: number | null;
    createdAt: string;
    matchScore: number;
    breakdown: {
        skillScore: number;
        categoryScore: number;
        languageScore: number;
        recencyScore: number;
    };
    project: { id: string; title: string; slug: string };
    contributor: {
        id: string;
        name: string;
        email: string;
        image: string | null;
        contributorProfile?: {
            bio: string | null;
            skills: Array<{ skill: { name: string; nameAr: string | null } }>;
        } | null;
    };
    _count: { messages: number };
}

interface ApplicationListClientProps {
    applications: ApplicationWithScore[];
    locale: string;
}

const TABS = ["ALL", "PENDING", "ACCEPTED", "REJECTED"] as const;

export function ApplicationListClient({ applications, locale }: ApplicationListClientProps) {
    const t = useTranslations("applications");
    const [activeTab, setActiveTab] = useState<typeof TABS[number]>("ALL");

    const filtered = activeTab === "ALL"
        ? applications
        : applications.filter(a => a.status === activeTab);

    // Sort by match score descending (pending first)
    const sorted = [...filtered].sort((a, b) => {
        if (a.status === "PENDING" && b.status !== "PENDING") return -1;
        if (b.status === "PENDING" && a.status !== "PENDING") return 1;
        return b.matchScore - a.matchScore;
    });

    const tabLabels: Record<typeof TABS[number], string> = {
        ALL: t("filterAll"),
        PENDING: t("filterPending"),
        ACCEPTED: t("filterAccepted"),
        REJECTED: t("filterRejected"),
    };

    return (
        <div>
            {/* Filter Tabs */}
            <div className="flex gap-1 mb-6 bg-white rounded-xl border border-secondary-100 p-1">
                {TABS.map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === tab
                                ? "bg-primary-600 text-white shadow-sm"
                                : "text-secondary-500 hover:text-secondary-700 hover:bg-secondary-50"
                            }`}
                    >
                        {tabLabels[tab]}
                        {tab !== "ALL" && (
                            <span className={`ml-1.5 text-xs ${activeTab === tab ? "text-white/70" : "text-secondary-400"}`}>
                                ({applications.filter(a => a.status === tab).length})
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Applications List */}
            {sorted.length === 0 ? (
                <div className="bg-white rounded-xl border border-secondary-100 p-12 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-secondary-100 rounded-full flex items-center justify-center">
                        <MessageSquare className="w-8 h-8 text-secondary-400" />
                    </div>
                    <h3 className="text-lg font-medium text-secondary-900 mb-2">
                        {t("noApplications")}
                    </h3>
                    <p className="text-secondary-500 max-w-md mx-auto">
                        {t("shareToAttract")}
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {sorted.map(app => (
                        <div
                            key={app.id}
                            className="bg-white rounded-xl border border-secondary-100 p-5 hover:border-primary-200 transition-all"
                        >
                            <div className="flex gap-5">
                                {/* Match Score */}
                                <div className="shrink-0 hidden sm:block">
                                    <MatchScoreBadge
                                        score={app.matchScore}
                                        breakdown={app.breakdown}
                                    />
                                </div>

                                {/* Main content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-3 mb-2">
                                        <div className="flex items-center gap-3">
                                            {app.contributor.image ? (
                                                <Image
                                                    src={app.contributor.image}
                                                    alt={app.contributor.name}
                                                    width={40}
                                                    height={40}
                                                    className="rounded-full"
                                                />
                                            ) : (
                                                <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-sm font-bold text-primary-700">
                                                    {app.contributor.name.charAt(0)}
                                                </div>
                                            )}
                                            <div>
                                                <Link
                                                    href={`/${locale}/profile/${app.contributor.id}`}
                                                    className="font-semibold text-secondary-900 hover:text-primary-600 transition-colors"
                                                >
                                                    {app.contributor.name}
                                                </Link>
                                                <p className="text-xs text-secondary-400">{app.contributor.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="sm:hidden">
                                                <MatchScoreBadge score={app.matchScore} compact />
                                            </div>
                                            <ApplicationStatusBadge status={app.status as ApplicationStatus} locale={locale} />
                                        </div>
                                    </div>

                                    {/* Skills */}
                                    {app.contributor.contributorProfile?.skills && (
                                        <div className="flex flex-wrap gap-1.5 mb-2">
                                            {app.contributor.contributorProfile.skills.slice(0, 5).map((s, i) => (
                                                <span key={i} className="px-2 py-0.5 bg-secondary-50 text-secondary-600 rounded text-xs">
                                                    {locale === "ar" ? s.skill.nameAr || s.skill.name : s.skill.name}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    {/* Message */}
                                    {app.message && (
                                        <p className="text-sm text-secondary-600 line-clamp-2 mb-2">
                                            {app.message}
                                        </p>
                                    )}

                                    {/* Meta */}
                                    <div className="flex flex-wrap items-center gap-4 text-xs text-secondary-400 mb-3">
                                        <span className="flex items-center gap-1">
                                            <Calendar className="w-3.5 h-3.5" />
                                            {new Date(app.createdAt).toLocaleDateString(locale === "ar" ? "ar-SA" : "en-US", {
                                                month: "short", day: "numeric", year: "numeric",
                                            })}
                                        </span>
                                        {app.hoursPerWeek && (
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-3.5 h-3.5" />
                                                {app.hoursPerWeek}h/week
                                            </span>
                                        )}
                                        {app._count.messages > 0 && (
                                            <span className="flex items-center gap-1">
                                                <MessageSquare className="w-3.5 h-3.5" />
                                                {app._count.messages} {locale === "ar" ? "رسالة" : "messages"}
                                            </span>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <ApplicationActions
                                        applicationId={app.id}
                                        currentStatus={app.status}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
