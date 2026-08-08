"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { CircleCheck, Circle, Loader2, AlertTriangle } from "lucide-react";
import type { ProjectStatus } from "@prisma/client";

interface StatusWorkflowProps {
    projectId: string;
    currentStatus: string;
    adminFeedback: string | null;
    locale: string;
}

const STATUS_ORDER = ["DRAFT", "PENDING", "OPEN", "IN_PROGRESS", "COMPLETED"];

export function StatusWorkflow({ projectId, currentStatus, adminFeedback, locale }: StatusWorkflowProps) {
    const t = useTranslations("projects");
    const [status, setStatus] = useState(currentStatus);
    const [feedback, setFeedback] = useState(adminFeedback);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const statusLabels: Record<string, string> = {
        DRAFT: t("statusDraft"),
        PENDING: t("statusPending"),
        OPEN: t("statusOpen"),
        IN_PROGRESS: t("statusInProgress"),
        COMPLETED: t("statusCompleted"),
        CANCELLED: t("statusCancelled"),
    };

    const currentIndex = STATUS_ORDER.indexOf(status);

    const transition = async (newStatus: ProjectStatus) => {
        setLoading(true);
        setError("");
        try {
            const res = await fetch(`/api/projects/${projectId}/status`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error);
            }
            const data = await res.json();
            setStatus(data.status);
            setFeedback(data.adminFeedback);
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to update status";
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    // Possible actions based on status
    const actions: Array<{ label: string; newStatus: ProjectStatus; variant: "primary" | "danger" }> = [];
    if (status === "DRAFT") {
        actions.push({ label: t("submitForReview"), newStatus: "PENDING", variant: "primary" });
    } else if (status === "OPEN") {
        actions.push({ label: t("markInProgress"), newStatus: "IN_PROGRESS", variant: "primary" });
    } else if (status === "IN_PROGRESS") {
        actions.push({ label: t("markCompleted"), newStatus: "COMPLETED", variant: "primary" });
    }
    if (["DRAFT", "OPEN", "IN_PROGRESS"].includes(status)) {
        actions.push({ label: t("cancelProject"), newStatus: "CANCELLED", variant: "danger" });
    }
    if (status === "CANCELLED") {
        actions.push({ label: t("reopenProject"), newStatus: "DRAFT", variant: "primary" });
    }

    return (
        <div className="bg-white rounded-2xl border border-waqf-border p-6">
            <h3 className="text-sm font-semibold text-secondary-900 mb-4">{t("statusWorkflow")}</h3>

            {/* Progress steps */}
            <div className="flex items-center gap-1 mb-5">
                {STATUS_ORDER.map((s, i) => {
                    const isDone = i < currentIndex || (status === "COMPLETED" && i <= currentIndex);
                    const isCurrent = s === status;
                    return (
                        <div key={s} className="flex items-center flex-1">
                            <div className="flex flex-col items-center flex-1">
                                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs ${isDone
                                    ? "bg-primary-600 text-white"
                                    : isCurrent
                                        ? "bg-primary-100 text-primary-600 ring-2 ring-primary-600"
                                        : "bg-secondary-100 text-secondary-400"
                                    }`}>
                                    {isDone ? <CircleCheck className="w-4 h-4" /> : <Circle className="w-3 h-3" />}
                                </div>
                                <span className={`text-[10px] mt-1 text-center ${isCurrent ? "font-bold text-primary-600" : "text-secondary-400"}`}>
                                    {statusLabels[s]}
                                </span>
                            </div>
                            {i < STATUS_ORDER.length - 1 && (
                                <div className={`h-0.5 flex-1 mx-0.5 ${i < currentIndex ? "bg-primary-600" : "bg-secondary-200"}`} />
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Admin feedback */}
            {feedback && status === "DRAFT" && (
                <div className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                        <p className="text-xs font-bold text-amber-800">{t("adminFeedback")}</p>
                        <p className="text-xs text-amber-700 mt-1">{feedback}</p>
                    </div>
                </div>
            )}

            {/* Error */}
            {error && (
                <div className="mb-3 p-2 rounded-lg bg-red-50 text-red-600 text-xs">{error}</div>
            )}

            {/* Actions */}
            {actions.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {actions.map(action => (
                        <button
                            key={action.newStatus}
                            onClick={() => transition(action.newStatus)}
                            disabled={loading}
                            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 ${action.variant === "primary"
                                ? "bg-primary-600 text-white hover:bg-primary-700"
                                : "bg-red-50 text-red-600 hover:bg-red-100 border border-red-200"
                                }`}
                        >
                            {loading && <Loader2 className="w-3 h-3 animate-spin" />}
                            {action.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
