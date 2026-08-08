"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import {
    Users,
    FolderKanban,
    FileCheck,
    TrendingUp,
    Clock,
    CheckCircle2,
    XCircle,
    AlertCircle,
    ArrowUpRight,
    ArrowDownRight
} from "lucide-react";

interface Stats {
    overview: {
        totalUsers: number;
        totalProjects: number;
        totalApplications: number;
        pendingProjects: number;
        activeProjects: number;
    };
    growth: {
        newUsersThisMonth: number;
        newProjectsThisMonth: number;
        newApplicationsThisWeek: number;
    };
    rates: {
        acceptanceRate: number;
    };
    breakdown: {
        projectsByStatus: Record<string, number>;
        applicationsByStatus: Record<string, number>;
    };
    recent: {
        projects: Array<{
            id: string;
            title: string;
            status: string;
            source: string;
            createdAt: string;
            owner: { name: string; image: string | null } | null;
        }>;
        topContributors: Array<{
            id: string;
            name: string;
            image: string | null;
            _count: { applications: number };
        }>;
    };
}

interface AdminDashboardProps {
    locale: string;
}

export function AdminDashboard({ locale }: AdminDashboardProps) {
    const [stats, setStats] = useState<Stats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const t = useTranslations("admin");
    const isAr = locale === "ar";

    useEffect(() => {
        async function fetchStats() {
            try {
                const response = await fetch("/api/admin/stats");
                if (response.ok) {
                    const data = await response.json();
                    setStats(data);
                }
            } catch (error) {
                console.error("Failed to fetch stats:", error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchStats();
    }, []);

    if (isLoading) {
        return (
            <div className="animate-pulse space-y-6">
                <div className="h-8 bg-secondary-200 rounded w-48"></div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-32 bg-secondary-200 rounded-xl"></div>
                    ))}
                </div>
            </div>
        );
    }

    if (!stats) {
        return (
            <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-secondary-400 mx-auto mb-4" />
                <p className="text-secondary-600">
                    {isAr ? "فشل في تحميل الإحصائيات" : "Failed to load statistics"}
                </p>
            </div>
        );
    }

    const statCards = [
        {
            label: t("totalUsers"),
            value: stats.overview.totalUsers,
            change: stats.growth.newUsersThisMonth,
            changeLabel: t("thisMonth"),
            icon: Users,
            color: "bg-blue-500",
        },
        {
            label: t("totalProjects"),
            value: stats.overview.totalProjects,
            change: stats.growth.newProjectsThisMonth,
            changeLabel: t("thisMonth"),
            icon: FolderKanban,
            color: "bg-primary-500",
        },
        {
            label: t("totalApplications"),
            value: stats.overview.totalApplications,
            change: stats.growth.newApplicationsThisWeek,
            changeLabel: t("thisWeek"),
            icon: FileCheck,
            color: "bg-amber-500",
        },
        {
            label: t("acceptanceRate"),
            value: `${stats.rates.acceptanceRate}%`,
            change: null,
            changeLabel: "",
            icon: TrendingUp,
            color: "bg-green-500",
        },
    ];

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-secondary-900">
                    {t("dashboard")}
                </h1>
                <p className="text-secondary-500 mt-1">
                    {isAr ? "نظرة عامة على نشاط المنصة" : "Platform activity overview"}
                </p>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((card, index) => {
                    const Icon = card.icon;
                    return (
                        <div
                            key={index}
                            className="bg-white rounded-2xl p-6 border border-secondary-100 shadow-sm"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className={`p-3 rounded-xl ${card.color} text-white`}>
                                    <Icon className="w-5 h-5" />
                                </div>
                                {card.change !== null && card.change > 0 && (
                                    <div className="flex items-center gap-1 text-green-600 text-sm font-medium">
                                        <ArrowUpRight className="w-4 h-4" />
                                        +{card.change}
                                    </div>
                                )}
                            </div>
                            <p className="text-3xl font-bold text-secondary-900">{card.value}</p>
                            <p className="text-sm text-secondary-500 mt-1">{card.label}</p>
                            {card.changeLabel && (
                                <p className="text-xs text-secondary-400 mt-0.5">{card.changeLabel}</p>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Action Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Pending Projects */}
                <div className="bg-white rounded-2xl p-6 border border-secondary-100 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-amber-100 text-amber-600">
                                <Clock className="w-5 h-5" />
                            </div>
                            <div>
                            <h3 className="font-semibold text-secondary-900">
                                {t("pendingReview")}
                            </h3>
                            <p className="text-sm text-secondary-500">
                                {stats.overview.pendingProjects} {isAr ? "مشروع" : "projects"}
                            </p>
                            </div>
                        </div>
                        <Link
                            href={`/${locale}/admin/projects?status=PENDING`}
                            className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                        >
                            {isAr ? "عرض الكل" : "View all"} →
                        </Link>
                    </div>

                    <div className="space-y-3">
                        {stats.recent.projects.slice(0, 3).map((project) => (
                            <div
                                key={project.id}
                                className="flex items-center justify-between p-3 bg-secondary-50 rounded-xl"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-sm font-bold text-primary-700">
                                        {(project.owner?.name ?? (project.source === "EXTERNAL" ? "C" : "?")).charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-medium text-secondary-900 text-sm">
                                            {project.title}
                                        </p>
                                        <p className="text-xs text-secondary-500">
                                            {project.owner?.name ?? (project.source === "EXTERNAL" ? "Curated" : "—")}
                                        </p>
                                    </div>
                                </div>
                                <StatusBadge status={project.status} />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Project Status Breakdown */}
                <div className="bg-white rounded-2xl p-6 border border-secondary-100 shadow-sm">
                    <h3 className="font-semibold text-secondary-900 mb-6">
                        {isAr ? "حالة المشاريع" : "Project Status"}
                    </h3>

                    <div className="space-y-4">
                        {Object.entries(stats.breakdown.projectsByStatus).map(([status, count]) => {
                            const total = stats.overview.totalProjects || 1;
                            const percentage = Math.round((count / total) * 100);

                            return (
                                <div key={status}>
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-sm text-secondary-600">{status}</span>
                                        <span className="text-sm font-medium text-secondary-900">
                                            {count} ({percentage}%)
                                        </span>
                                    </div>
                                    <div className="h-2 bg-secondary-100 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full ${getStatusColor(status)}`}
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Top Contributors */}
            <div className="bg-white rounded-2xl p-6 border border-secondary-100 shadow-sm">
                <h3 className="font-semibold text-secondary-900 mb-6">
                    {isAr ? "أكثر المساهمين نشاطاً" : "Top Contributors"}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    {stats.recent.topContributors.map((contributor, index) => (
                        <div
                            key={contributor.id}
                            className="flex flex-col items-center p-4 bg-secondary-50 rounded-xl"
                        >
                            <div className="relative mb-3">
                                <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-lg font-bold text-primary-700">
                                    {contributor.name?.charAt(0) || "?"}
                                </div>
                                <span className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                                    {index + 1}
                                </span>
                            </div>
                            <p className="font-medium text-secondary-900 text-sm text-center line-clamp-1">
                                {contributor.name}
                            </p>
                            <p className="text-xs text-secondary-500">
                                {contributor._count.applications} {isAr ? "طلب" : "applications"}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const config: Record<string, { icon: React.ElementType; color: string }> = {
        PENDING: { icon: Clock, color: "bg-amber-100 text-amber-700" },
        OPEN: { icon: CheckCircle2, color: "bg-green-100 text-green-700" },
        CANCELLED: { icon: XCircle, color: "bg-red-100 text-red-700" },
    };

    const { icon: Icon, color } = config[status] || config.PENDING;

    return (
        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${color}`}>
            <Icon className="w-3 h-3" />
            {status}
        </span>
    );
}

function getStatusColor(status: string): string {
    const colors: Record<string, string> = {
        DRAFT: "bg-secondary-400",
        PENDING: "bg-amber-500",
        OPEN: "bg-green-500",
        IN_PROGRESS: "bg-blue-500",
        COMPLETED: "bg-primary-500",
        CANCELLED: "bg-red-500",
    };
    return colors[status] || "bg-secondary-400";
}
