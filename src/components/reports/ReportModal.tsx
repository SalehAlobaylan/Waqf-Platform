"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { X, Flag, Loader2, CircleCheck } from "lucide-react";
import { apiFetch } from "@/lib/api/client";
import { translateApiError } from "@/lib/i18n/client-errors";

interface ReportModalProps {
    targetType: "PROJECT" | "USER" | "APPLICATION";
    targetId: string;
    isOpen: boolean;
    onClose: () => void;
}

const REASONS = ["spam", "inappropriate", "harassment", "copyright", "other"] as const;

export function ReportModal({ targetType, targetId, isOpen, onClose }: ReportModalProps) {
    const t = useTranslations("reports");
    const tGlobal = useTranslations();
    const [reason, setReason] = useState("");
    const [details, setDetails] = useState("");
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState("");

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!reason) return;

        setLoading(true);
        setError("");
        try {
            await apiFetch<{ success: boolean }>("/api/reports", {
                method: "POST",
                body: { targetType, targetId, reason, details },
            });

            setSubmitted(true);
            setTimeout(() => {
                onClose();
                setSubmitted(false);
                setReason("");
                setDetails("");
            }, 2000);
        } catch (err) {
            setError(translateApiError(tGlobal, err));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-secondary-100">
                    <div className="flex items-center gap-2">
                        <Flag className="w-5 h-5 text-red-500" />
                        <h2 className="text-lg font-bold text-secondary-900">{t("reportContent")}</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-lg hover:bg-secondary-100 transition-colors"
                    >
                        <X className="w-5 h-5 text-secondary-400" />
                    </button>
                </div>

                {submitted ? (
                    <div className="p-8 text-center">
                        <CircleCheck className="w-12 h-12 text-green-500 mx-auto mb-3" />
                        <p className="text-lg font-medium text-secondary-900">{t("submitted")}</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="p-5 space-y-4">
                        {/* Reason */}
                        <div>
                            <label className="block text-sm font-medium text-secondary-700 mb-1.5">
                                {t("reason")}
                            </label>
                            <select
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                required
                                className="w-full px-3 py-2.5 border border-secondary-200 rounded-xl text-sm bg-white focus:ring-1 focus:ring-primary-600 focus:border-primary-600"
                            >
                                <option value="">{t("reasonPlaceholder")}</option>
                                {REASONS.map((r) => (
                                    <option key={r} value={r}>{t(r)}</option>
                                ))}
                            </select>
                        </div>

                        {/* Details */}
                        <div>
                            <label className="block text-sm font-medium text-secondary-700 mb-1.5">
                                {t("details")}
                            </label>
                            <textarea
                                value={details}
                                onChange={(e) => setDetails(e.target.value)}
                                rows={3}
                                placeholder={t("detailsPlaceholder")}
                                className="w-full px-3 py-2.5 border border-secondary-200 rounded-xl text-sm resize-none focus:ring-1 focus:ring-primary-600 focus:border-primary-600"
                            />
                        </div>

                        {error && <p className="text-sm text-red-500">{error}</p>}

                        <button
                            type="submit"
                            disabled={loading || !reason}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50"
                        >
                            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                            {loading ? t("submitting") : t("submit")}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
