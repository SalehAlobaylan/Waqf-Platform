"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { CircleCheck, CircleX, Loader2 } from "lucide-react";
import { apiFetch } from "@/lib/api/client";
import { toast } from "@/lib/toast";
import { translateApiError } from "@/lib/i18n/client-errors";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

interface ApplicationActionsProps {
    applicationId: string;
    currentStatus: string;
    onStatusChange?: (newStatus: string) => void;
}

export function ApplicationActions({ applicationId, currentStatus, onStatusChange }: ApplicationActionsProps) {
    const t = useTranslations("applicationDetail");
    const tGlobal = useTranslations();
    const tCommon = useTranslations("common");
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState(currentStatus);
    const [confirmAction, setConfirmAction] = useState<"ACCEPTED" | "REJECTED" | null>(null);

    if (status !== "PENDING") return null;

    const handleAction = async (newStatus: "ACCEPTED" | "REJECTED") => {
        setLoading(true);
        try {
            await apiFetch(`/api/applications/${applicationId}/status`, {
                method: "PATCH",
                body: { status: newStatus },
            });
            setStatus(newStatus);
            setConfirmAction(null);
            onStatusChange?.(newStatus);
        } catch (err) {
            toast.error(translateApiError(tGlobal, err));
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-2">
            <div className="flex gap-2">
                <button
                    onClick={() => setConfirmAction("ACCEPTED")}
                    disabled={loading}
                    className="flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                    {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CircleCheck className="w-3.5 h-3.5" />}
                    {t("accept")}
                </button>
                <button
                    onClick={() => setConfirmAction("REJECTED")}
                    disabled={loading}
                    className="flex items-center gap-1.5 px-4 py-2 bg-red-50 text-red-600 text-sm font-medium rounded-lg border border-red-200 hover:bg-red-100 transition-colors disabled:opacity-50"
                >
                    {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CircleX className="w-3.5 h-3.5" />}
                    {t("reject")}
                </button>
            </div>

            <ConfirmDialog
                open={confirmAction !== null}
                onOpenChange={(open) => { if (!open) setConfirmAction(null); }}
                title={confirmAction === "ACCEPTED" ? t("accept") : t("reject")}
                description={confirmAction === "ACCEPTED" ? t("acceptConfirm") : t("rejectConfirm")}
                confirmLabel={confirmAction === "ACCEPTED" ? t("accept") : t("reject")}
                cancelLabel={tCommon("cancel")}
                tone={confirmAction === "REJECTED" ? "danger" : "default"}
                onConfirm={() => {
                    if (confirmAction) return handleAction(confirmAction);
                }}
            />
        </div>
    );
}
