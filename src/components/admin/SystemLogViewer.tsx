"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import {
    ScrollText,
    Loader2,
    RefreshCw,
    Trash2,
    ChevronDown,
    ChevronUp,
    AlertTriangle,
} from "lucide-react";
import { apiFetch } from "@/lib/api/client";
import { toast } from "@/lib/toast";
import { translateApiError } from "@/lib/i18n/client-errors";

interface SystemErrorLog {
    id: string;
    scope: string;
    code: string;
    status: number;
    message: string;
    method: string;
    path: string;
    userId: string | null;
    stack: string | null;
    createdAt: string;
}

type LogsResponse = {
    logs: SystemErrorLog[];
    total: number;
    page: number;
    pages: number;
};

export function SystemLogViewer() {
    const t = useTranslations("admin");
    const tGlobal = useTranslations();
    const [logs, setLogs] = useState<SystemErrorLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<"ALL" | "5XX">("ALL");
    const [clearing, setClearing] = useState(false);
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const fetchLogs = useCallback(async () => {
        setLoading(true);
        try {
            const data = await apiFetch<LogsResponse>("/api/admin/system-logs", {
                query: {
                    page: 1,
                    limit: 50,
                    status: filter === "5XX" ? 500 : undefined,
                },
            });
            setLogs(data.logs || []);
        } catch (err) {
            toast.error(translateApiError(tGlobal, err));
            setLogs([]);
        } finally {
            setLoading(false);
        }
    }, [filter, tGlobal]);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    const handleClear = async () => {
        setClearing(true);
        try {
            const res = await apiFetch<{ deleted: number }>("/api/admin/system-logs", {
                method: "DELETE",
                query: { olderThanDays: 30 },
            });
            toast.success(t("logsCleared"));
            await fetchLogs();
        } catch (err) {
            toast.error(translateApiError(tGlobal, err));
        } finally {
            setClearing(false);
        }
    };

    const statusBadge = (status: number) => (
        <span
            className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                status >= 500
                    ? "bg-red-100 text-red-700"
                    : "bg-amber-100 text-amber-700"
            }`}
        >
            {status}
        </span>
    );

    const methodBadge = (method: string) => (
        <span className="px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide bg-secondary-100 text-secondary-600 rounded">
            {method}
        </span>
    );

    return (
        <div className="space-y-6">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-3">
                <div className="flex gap-1 bg-white rounded-xl border border-secondary-100 p-1">
                    {(["ALL", "5XX"] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                filter === f
                                    ? "bg-primary-600 text-white shadow-sm"
                                    : "text-secondary-500 hover:text-secondary-700 hover:bg-secondary-50"
                            }`}
                        >
                            {f === "ALL" ? t("filterAll") : t("filterServerErrors")}
                        </button>
                    ))}
                </div>

                <div className="ml-auto flex items-center gap-2">
                    <button
                        onClick={fetchLogs}
                        disabled={loading}
                        className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-secondary-600 bg-white border border-secondary-200 rounded-xl hover:bg-secondary-50 transition-colors"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                        {tGlobal("common.refresh")}
                    </button>
                    <button
                        onClick={handleClear}
                        disabled={clearing}
                        className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-xl hover:bg-red-100 transition-colors"
                    >
                        <Trash2 className="w-4 h-4" />
                        {t("clearOld")}
                    </button>
                </div>
            </div>

            {/* Logs List */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
                </div>
            ) : logs.length === 0 ? (
                <div className="bg-white rounded-xl border border-secondary-100 p-12 text-center">
                    <AlertTriangle className="w-12 h-12 text-secondary-300 mx-auto mb-3" />
                    <p className="text-secondary-500">{t("noLogs")}</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {logs.map((logEntry) => (
                        <div
                            key={logEntry.id}
                            className="bg-white rounded-xl border border-secondary-100 p-5"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                                        {statusBadge(logEntry.status)}
                                        {methodBadge(logEntry.method)}
                                        <span className="text-xs font-mono text-secondary-500 truncate">
                                            {logEntry.path}
                                        </span>
                                    </div>
                                    <p className="text-sm font-medium text-secondary-900 mb-0.5">
                                        {logEntry.message}
                                    </p>
                                    <p className="text-xs text-secondary-400 font-mono">
                                        {logEntry.scope} · {logEntry.code}
                                        {logEntry.userId ? ` · user ${logEntry.userId.slice(0, 8)}…` : ""}
                                    </p>
                                </div>
                                <div className="text-right text-xs text-secondary-400 shrink-0 flex flex-col items-end gap-1">
                                    <p>{new Date(logEntry.createdAt).toLocaleString()}</p>
                                    {logEntry.stack && (
                                        <button
                                            onClick={() =>
                                                setExpandedId(expandedId === logEntry.id ? null : logEntry.id)
                                            }
                                            className="flex items-center gap-1 text-secondary-500 hover:text-primary-600"
                                        >
                                            {t("stackTrace")}
                                            {expandedId === logEntry.id ? (
                                                <ChevronUp className="w-3.5 h-3.5" />
                                            ) : (
                                                <ChevronDown className="w-3.5 h-3.5" />
                                            )}
                                        </button>
                                    )}
                                </div>
                            </div>

                            {expandedId === logEntry.id && logEntry.stack && (
                                <pre className="mt-3 p-3 bg-secondary-900 text-secondary-100 text-xs font-mono rounded-lg overflow-x-auto whitespace-pre-wrap break-words max-h-72 overflow-y-auto">
                                    {logEntry.stack}
                                </pre>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}