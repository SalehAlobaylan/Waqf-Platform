"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { X, Send, Loader2, Link as LinkIcon, Clock } from "lucide-react";
import { apiFetch } from "@/lib/api/client";
import { translateApiError } from "@/lib/i18n/client-errors";

interface ApplyModalProps {
    project: {
        id: string;
        title: string;
        slug: string;
    };
    isOpen: boolean;
    onClose: () => void;
}

export function ApplyModal({ project, isOpen, onClose }: ApplyModalProps) {
    const t = useTranslations("applications");
    const tGlobal = useTranslations();
    const locale = useLocale();
    const router = useRouter();

    const [message, setMessage] = useState("");
    const [portfolioUrl, setPortfolioUrl] = useState("");
    const [hoursPerWeek, setHoursPerWeek] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsSubmitting(true);

        try {
            await apiFetch<{ success: boolean }>("/api/applications", {
                method: "POST",
                body: {
                    projectId: project.id,
                    message,
                    portfolioUrl: portfolioUrl || null,
                    hoursPerWeek: hoursPerWeek || null,
                },
            });

            // Success - redirect to applications
            router.push(`/${locale}/dashboard/applications`);
            onClose();
        } catch (err) {
            setError(translateApiError(tGlobal, err));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-secondary-100 px-6 py-4 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-semibold text-secondary-900">
                            {t("applyTitle")}
                        </h2>
                        <p className="text-sm text-secondary-500 mt-0.5">
                            {project.title}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-secondary-400 hover:text-secondary-600 hover:bg-secondary-100 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Message */}
                    <div>
                        <label className="block text-sm font-medium text-secondary-700 mb-1.5">
                            {t("whyContribute")} <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder={t("whyContributePlaceholder")}
                            rows={4}
                            required
                            className="w-full px-4 py-3 border border-secondary-200 rounded-xl text-secondary-900
                                       placeholder-secondary-400 focus:border-primary-400 focus:ring-2 
                                       focus:ring-primary-100 transition-all resize-none"
                        />
                        <p className="mt-1 text-xs text-secondary-400">
                            {t("whyContributeHint")}
                        </p>
                    </div>

                    {/* Portfolio URL */}
                    <div>
                        <label className="block text-sm font-medium text-secondary-700 mb-1.5">
                            <LinkIcon className="w-4 h-4 inline mr-1.5" />
                            {t("portfolioUrl")}
                        </label>
                        <input
                            type="url"
                            value={portfolioUrl}
                            onChange={(e) => setPortfolioUrl(e.target.value)}
                            placeholder="https://github.com/username or portfolio link"
                            className="w-full px-4 py-3 border border-secondary-200 rounded-xl text-secondary-900
                                       placeholder-secondary-400 focus:border-primary-400 focus:ring-2 
                                       focus:ring-primary-100 transition-all"
                        />
                    </div>

                    {/* Hours per week */}
                    <div>
                        <label className="block text-sm font-medium text-secondary-700 mb-1.5">
                            <Clock className="w-4 h-4 inline mr-1.5" />
                            {t("hoursPerWeek")}
                        </label>
                        <select
                            value={hoursPerWeek}
                            onChange={(e) => setHoursPerWeek(e.target.value)}
                            className="w-full px-4 py-3 border border-secondary-200 rounded-xl text-secondary-900
                                       focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all"
                        >
                            <option value="">{t("selectHours")}</option>
                            <option value="1">1-2 {t("hoursLabel")}</option>
                            <option value="3">3-5 {t("hoursLabel")}</option>
                            <option value="5">5-10 {t("hoursLabel")}</option>
                            <option value="10">10+ {t("hoursLabel")}</option>
                        </select>
                    </div>

                    {/* Submit */}
                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={isSubmitting || !message.trim()}
                            className="w-full py-3.5 bg-primary-600 text-white font-medium rounded-xl
                                       hover:bg-primary-700 focus:ring-4 focus:ring-primary-100
                                       disabled:opacity-50 disabled:cursor-not-allowed
                                       transition-all flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    {t("submitting")}
                                </>
                            ) : (
                                <>
                                    <Send className="w-5 h-5" />
                                    {t("submitApplication")}
                                </>
                            )}
                        </button>
                    </div>

                    <p className="text-xs text-center text-secondary-400">
                        {t("applicationNote")}
                    </p>
                </form>
            </div>
        </div>
    );
}
