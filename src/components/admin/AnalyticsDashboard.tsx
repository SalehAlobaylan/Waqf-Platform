"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import {
    Users,
    FolderKanban,
    FileCheck,
    TrendingUp,
    Calendar,
    BarChart3,
    PieChart,
    Activity,
    CircleAlert,
    Loader2
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
            createdAt: string;
            owner: { name: string; image: string | null };
        }>;
        topContributors: Array<{
            id: string;
            name: string;
            image: string | null;
            _count: { applications: number };
        }>;
    };
}

interface AnalyticsDashboardProps {
    locale: string;
}

export function AnalyticsDashboard({ locale }: AnalyticsDashboardProps) {
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
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
            </div>
        );
    }

    if (!stats) {
        return (
            <div className="text-center py-12">
                <CircleAlert className="w-12 h-12 text-secondary-400 mx-auto mb-4" />
                <p className="text-secondary-600">
                    {isAr ? "فشل في تحميل الإحصائيات" : "Failed to load statistics"}
                </p>
            </div>
        );
    }

    // Calculate totals for charts
    const totalProjectsByStatus = Object.values(stats.breakdown.projectsByStatus).reduce((a, b) => a + b, 0);
    const totalApplicationsByStatus = Object.values(stats.breakdown.applicationsByStatus).reduce((a, b) => a + b, 0);

    // Palette mirrors the CSS tokens: slate-400, accent-500, primary scale
    const statusColors: Record<string, string> = {
        DRAFT: "#94a3b8",
        PENDING: "#d4a056",
        OPEN: "#1f705d",
        IN_PROGRESS: "#258e78",
        COMPLETED: "#195c4c",
        CANCELLED: "#dc2626",
        ACCEPTED: "#1f705d",
        REJECTED: "#dc2626",
        WITHDRAWN: "#94a3b8",
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-secondary-900">
                    {t("analytics")}
                </h1>
                <p className="text-secondary-500 mt-1">
                    {isAr ? "تحليلات مفصلة عن نشاط المنصة" : "Detailed platform activity analytics"}
                </p>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                    label={t("totalUsers")}
                    value={stats.overview.totalUsers}
                    growth={stats.growth.newUsersThisMonth}
                    growthLabel={t("thisMonth")}
                    icon={Users}
                    color="bg-blue-500"
                />
                <MetricCard
                    label={t("totalProjects")}
                    value={stats.overview.totalProjects}
                    growth={stats.growth.newProjectsThisMonth}
                    growthLabel={t("thisMonth")}
                    icon={FolderKanban}
                    color="bg-primary-500"
                />
                <MetricCard
                    label={t("activeProjects")}
                    value={stats.overview.activeProjects}
                    icon={Activity}
                    color="bg-green-500"
                />
                <MetricCard
                    label={t("acceptanceRate")}
                    value={`${stats.rates.acceptanceRate}%`}
                    icon={TrendingUp}
                    color="bg-amber-500"
                />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Project Status Breakdown */}
                <div className="bg-white rounded-lg border border-secondary-200 p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 rounded-lg bg-primary-100 text-primary-600">
                            <PieChart className="w-5 h-5" />
                        </div>
                        <h3 className="font-semibold text-secondary-900">
                            {isAr ? "توزيع حالة المشاريع" : "Project Status Distribution"}
                        </h3>
                    </div>

                    {/* Simple CSS-based chart */}
                    <div className="flex gap-8">
                        <div className="flex-1 space-y-3">
                            {Object.entries(stats.breakdown.projectsByStatus).map(([status, count]) => {
                                const percentage = totalProjectsByStatus > 0
                                    ? Math.round((count / totalProjectsByStatus) * 100)
                                    : 0;
                                return (
                                    <div key={status}>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-secondary-600">{status}</span>
                                            <span className="font-medium text-secondary-900">{count} ({percentage}%)</span>
                                        </div>
                                        <div className="h-3 bg-secondary-100 rounded-full overflow-hidden">
                                            <div
                                                className="h-full rounded-full transition-all duration-500"
                                                style={{
                                                    width: `${percentage}%`,
                                                    backgroundColor: statusColors[status] || "#94a3b8"
                                                }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Donut Chart */}
                        <div className="relative w-32 h-32 mx-auto">
                            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                                {(() => {
                                    let cumulative = 0;
                                    return Object.entries(stats.breakdown.projectsByStatus).map(([status, count]) => {
                                        const percentage = totalProjectsByStatus > 0
                                            ? (count / totalProjectsByStatus) * 100
                                            : 0;
                                        const strokeDasharray = `${percentage * 2.51} ${251.2 - percentage * 2.51}`;
                                        const strokeDashoffset = -cumulative * 2.51;
                                        cumulative += percentage;
                                        return (
                                            <circle
                                                key={status}
                                                cx="50"
                                                cy="50"
                                                r="40"
                                                fill="none"
                                                strokeWidth="20"
                                                stroke={statusColors[status] || "#94a3b8"}
                                                strokeDasharray={strokeDasharray}
                                                strokeDashoffset={strokeDashoffset}
                                            />
                                        );
                                    });
                                })()}
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-secondary-900">{totalProjectsByStatus}</p>
                                    <p className="text-xs text-secondary-500">{isAr ? "مشروع" : "Projects"}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Application Status Breakdown */}
                <div className="bg-white rounded-lg border border-secondary-200 p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 rounded-lg bg-green-100 text-green-600">
                            <BarChart3 className="w-5 h-5" />
                        </div>
                        <h3 className="font-semibold text-secondary-900">
                            {isAr ? "توزيع حالة الطلبات" : "Application Status Distribution"}
                        </h3>
                    </div>

                    <div className="space-y-4">
                        {Object.entries(stats.breakdown.applicationsByStatus).map(([status, count]) => {
                            const percentage = totalApplicationsByStatus > 0
                                ? Math.round((count / totalApplicationsByStatus) * 100)
                                : 0;
                            return (
                                <div key={status} className="flex items-center gap-4">
                                    <div
                                        className="w-3 h-3 rounded-full"
                                        style={{ backgroundColor: statusColors[status] || "#94a3b8" }}
                                    />
                                    <div className="flex-1">
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-secondary-600">{status}</span>
                                            <span className="font-medium text-secondary-900">{count}</span>
                                        </div>
                                        <div className="h-2 bg-secondary-100 rounded-full overflow-hidden">
                                            <div
                                                className="h-full rounded-full transition-all duration-500"
                                                style={{
                                                    width: `${percentage}%`,
                                                    backgroundColor: statusColors[status] || "#94a3b8"
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <span className="text-sm text-secondary-500 w-12 text-right">{percentage}%</span>
                                </div>
                            );
                        })}
                    </div>

                    <div className="mt-6 pt-4 border-t border-secondary-100">
                        <div className="flex justify-between text-sm">
                            <span className="text-secondary-600">{isAr ? "إجمالي الطلبات" : "Total Applications"}</span>
                            <span className="font-semibold text-secondary-900">{totalApplicationsByStatus}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Activity Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg border border-secondary-200 p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                            <Calendar className="w-5 h-5" />
                        </div>
                        <h3 className="font-semibold text-secondary-900">
                            {isAr ? "النمو الشهري" : "Monthly Growth"}
                        </h3>
                    </div>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-secondary-600">{isAr ? "مستخدمين جدد" : "New Users"}</span>
                            <span className="flex items-center gap-1 text-green-600 font-medium">
                                <TrendingUp className="w-4 h-4" />
                                +{stats.growth.newUsersThisMonth}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-secondary-600">{isAr ? "مشاريع جديدة" : "New Projects"}</span>
                            <span className="flex items-center gap-1 text-green-600 font-medium">
                                <TrendingUp className="w-4 h-4" />
                                +{stats.growth.newProjectsThisMonth}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-secondary-600">{isAr ? "طلبات هذا الأسبوع" : "Applications this week"}</span>
                            <span className="flex items-center gap-1 text-green-600 font-medium">
                                <TrendingUp className="w-4 h-4" />
                                +{stats.growth.newApplicationsThisWeek}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg border border-secondary-200 p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-lg bg-amber-100 text-amber-600">
                            <FileCheck className="w-5 h-5" />
                        </div>
                        <h3 className="font-semibold text-secondary-900">
                            {isAr ? "قيد الانتظار" : "Pending Items"}
                        </h3>
                    </div>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-secondary-600">{isAr ? "مشاريع للمراجعة" : "Projects to Review"}</span>
                            <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-lg font-medium">
                                {stats.overview.pendingProjects}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-secondary-600">{isAr ? "طلبات معلقة" : "Pending Applications"}</span>
                            <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-lg font-medium">
                                {stats.breakdown.applicationsByStatus["PENDING"] || 0}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg border border-secondary-200 p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-lg bg-green-100 text-green-600">
                            <TrendingUp className="w-5 h-5" />
                        </div>
                        <h3 className="font-semibold text-secondary-900">
                            {isAr ? "الإنجازات" : "Achievements"}
                        </h3>
                    </div>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-secondary-600">{isAr ? "مشاريع مكتملة" : "Completed Projects"}</span>
                            <span className="px-2 py-1 bg-green-100 text-green-700 rounded-lg font-medium">
                                {stats.breakdown.projectsByStatus["COMPLETED"] || 0}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-secondary-600">{isAr ? "طلبات مقبولة" : "Accepted Applications"}</span>
                            <span className="px-2 py-1 bg-green-100 text-green-700 rounded-lg font-medium">
                                {stats.breakdown.applicationsByStatus["ACCEPTED"] || 0}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

interface MetricCardProps {
    label: string;
    value: number | string;
    growth?: number;
    growthLabel?: string;
    icon: React.ElementType;
    color: string;
}

function MetricCard({ label, value, growth, growthLabel, icon: Icon, color }: MetricCardProps) {
    return (
        <div className="bg-white rounded-lg border border-secondary-200 p-6">
            <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-md ${color} text-white`}>
                    <Icon className="w-5 h-5" />
                </div>
                {growth !== undefined && growth > 0 && (
                    <div className="flex items-center gap-1 text-green-600 text-sm font-medium">
                        <TrendingUp className="w-4 h-4" />
                        +{growth}
                    </div>
                )}
            </div>
            <p className="text-3xl font-bold text-secondary-900">{value}</p>
            <p className="text-sm text-secondary-500 mt-1">{label}</p>
            {growthLabel && (
                <p className="text-xs text-secondary-400 mt-0.5">{growthLabel}</p>
            )}
        </div>
    );
}
