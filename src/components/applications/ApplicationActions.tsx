"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { CircleCheck, CircleX, Loader2 } from "lucide-react";

interface ApplicationActionsProps {
    applicationId: string;
    currentStatus: string;
    onStatusChange?: (newStatus: string) => void;
}

export function ApplicationActions({ applicationId, currentStatus, onStatusChange }: ApplicationActionsProps) {
    const t = useTranslations("applications");
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState(currentStatus);
    const [error, setError] = useState("");

    if (status !== "PENDING") return null;

    const handleAction = async (newStatus: "ACCEPTED" | "REJECTED") => {
        const confirmMsg = newStatus === "ACCEPTED" ? t("acceptConfirm") : t("rejectConfirm");
        if (!window.confirm(confirmMsg)) return;

        setLoading(true);
        setError("");
        try {
            const res = await fetch(`/api/applications/${applicationId}/status`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error);
            }
            setStatus(newStatus);
            onStatusChange?.(newStatus);
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to update";
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-2">
            {error && <p className="text-xs text-red-500">{error}</p>}
            <div className="flex gap-2">
                <button
                    onClick={() => handleAction("ACCEPTED")}
                    disabled={loading}
                    className="flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                    {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CircleCheck className="w-3.5 h-3.5" />}
                    {t("accept")}
                </button>
                <button
                    onClick={() => handleAction("REJECTED")}
                    disabled={loading}
                    className="flex items-center gap-1.5 px-4 py-2 bg-red-50 text-red-600 text-sm font-medium rounded-lg border border-red-200 hover:bg-red-100 transition-colors disabled:opacity-50"
                >
                    {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CircleX className="w-3.5 h-3.5" />}
                    {t("reject")}
                </button>
            </div>
        </div>
    );
}
