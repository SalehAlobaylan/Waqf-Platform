"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Flag, CheckCircle, XCircle, Eye, Clock, Loader2 } from "lucide-react";

interface Report {
    id: string;
    reporterId: string;
    reporter: { id: string; name: string; email: string; image: string | null };
    targetType: string;
    targetId: string;
    reason: string;
    details: string | null;
    status: string;
    resolvedBy: string | null;
    resolvedAt: string | null;
    createdAt: string;
}

export function ReportQueue() {
    const t = useTranslations("reports");
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("PENDING");
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const fetchReports = async () => {
        setLoading(true);
        try {
            const params = filter !== "ALL" ? `?status=${filter}` : "";
            const res = await fetch(`/api/reports${params}`);
            const data = await res.json();
            setReports(data.reports || []);
        } catch (error) {
            console.error("Error fetching reports:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, [filter]);

    const handleAction = async (reportId: string, status: string) => {
        setActionLoading(reportId);
        try {
            const res = await fetch(`/api/reports/${reportId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status }),
            });
            if (res.ok) {
                setReports(prev => prev.map(r =>
                    r.id === reportId ? { ...r, status } : r
                ));
            }
        } catch (error) {
            console.error("Error updating report:", error);
        } finally {
            setActionLoading(null);
        }
    };

    const statusBadge = (status: string) => {
        const styles: Record<string, string> = {
            PENDING: "bg-amber-100 text-amber-700",
            REVIEWED: "bg-blue-100 text-blue-700",
            RESOLVED: "bg-green-100 text-green-700",
            DISMISSED: "bg-secondary-100 text-secondary-500",
        };
        const labels: Record<string, string> = {
            PENDING: t("statusPending"),
            REVIEWED: t("statusReviewed"),
            RESOLVED: t("statusResolved"),
            DISMISSED: t("statusDismissed"),
        };
        return (
            <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${styles[status] || styles.PENDING}`}>
                {labels[status] || status}
            </span>
        );
    };

    const filters = ["ALL", "PENDING", "REVIEWED", "RESOLVED", "DISMISSED"];

    return (
        <div className="space-y-6">
            {/* Filter Tabs */}
            <div className="flex gap-1 bg-white rounded-xl border border-secondary-100 p-1 overflow-x-auto">
                {filters.map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${filter === f
                                ? "bg-primary-600 text-white shadow-sm"
                                : "text-secondary-500 hover:text-secondary-700 hover:bg-secondary-50"
                            }`}
                    >
                        {f === "ALL" ? t("statusPending").replace(t("statusPending"), "All") : (t as any)(`status${f.charAt(0) + f.slice(1).toLowerCase()}`)}
                    </button>
                ))}
            </div>

            {/* Reports List */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
                </div>
            ) : reports.length === 0 ? (
                <div className="bg-white rounded-xl border border-secondary-100 p-12 text-center">
                    <Flag className="w-12 h-12 text-secondary-300 mx-auto mb-3" />
                    <p className="text-secondary-500">No reports found</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {reports.map(report => (
                        <div key={report.id} className="bg-white rounded-xl border border-secondary-100 p-5">
                            <div className="flex items-start justify-between gap-4 mb-3">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        {statusBadge(report.status)}
                                        <span className="text-xs text-secondary-400 px-2 py-0.5 bg-secondary-50 rounded">
                                            {report.targetType}
                                        </span>
                                    </div>
                                    <p className="text-sm font-medium text-secondary-900 mb-1">
                                        {report.reason}
                                    </p>
                                    {report.details && (
                                        <p className="text-sm text-secondary-500">{report.details}</p>
                                    )}
                                </div>
                                <div className="text-right text-xs text-secondary-400 shrink-0">
                                    <p>{report.reporter.name}</p>
                                    <p>{new Date(report.createdAt).toLocaleDateString()}</p>
                                </div>
                            </div>

                            {/* Actions */}
                            {report.status === "PENDING" && (
                                <div className="flex gap-2 mt-3 pt-3 border-t border-secondary-100">
                                    <button
                                        onClick={() => handleAction(report.id, "REVIEWED")}
                                        disabled={actionLoading === report.id}
                                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                                    >
                                        <Eye className="w-3.5 h-3.5" />
                                        {t("markReviewed")}
                                    </button>
                                    <button
                                        onClick={() => handleAction(report.id, "RESOLVED")}
                                        disabled={actionLoading === report.id}
                                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                                    >
                                        <CheckCircle className="w-3.5 h-3.5" />
                                        {t("resolve")}
                                    </button>
                                    <button
                                        onClick={() => handleAction(report.id, "DISMISSED")}
                                        disabled={actionLoading === report.id}
                                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-secondary-500 bg-secondary-50 rounded-lg hover:bg-secondary-100 transition-colors"
                                    >
                                        <XCircle className="w-3.5 h-3.5" />
                                        {t("dismiss")}
                                    </button>
                                </div>
                            )}

                            {report.status === "REVIEWED" && (
                                <div className="flex gap-2 mt-3 pt-3 border-t border-secondary-100">
                                    <button
                                        onClick={() => handleAction(report.id, "RESOLVED")}
                                        disabled={actionLoading === report.id}
                                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                                    >
                                        <CheckCircle className="w-3.5 h-3.5" />
                                        {t("resolve")}
                                    </button>
                                    <button
                                        onClick={() => handleAction(report.id, "DISMISSED")}
                                        disabled={actionLoading === report.id}
                                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-secondary-500 bg-secondary-50 rounded-lg hover:bg-secondary-100 transition-colors"
                                    >
                                        <XCircle className="w-3.5 h-3.5" />
                                        {t("dismiss")}
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
