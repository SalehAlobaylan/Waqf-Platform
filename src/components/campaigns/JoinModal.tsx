"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Loader2, Users, X, Send } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api/client";
import { translateApiError } from "@/lib/i18n/client-errors";

export interface JoinableRole {
    id: string;
    title: string;
    description: string | null;
    count: number;
    filledCount: number;
    status: "OPEN" | "FILLED" | "CLOSED";
    skill: { id: number; name: string; nameAr: string | null };
}

interface Props {
    campaignId: string;
    campaignSlug: string;
    roles: JoinableRole[];
    isAuthed: boolean;
    isOwner: boolean;
    alreadyJoinedRoleIds: string[];
}

export function JoinModal({ campaignId, campaignSlug, roles, isAuthed, isOwner, alreadyJoinedRoleIds }: Props) {
    const locale = useLocale();
    const t = useTranslations("campaigns.join");
    const tDetail = useTranslations("campaigns.detail");
    const tGlobal = useTranslations();
    const router = useRouter();

    const openRoles = roles.filter(
        (r) => r.status === "OPEN" && r.filledCount < r.count && !alreadyJoinedRoleIds.includes(r.id)
    );
    const [open, setOpen] = useState(false);
    const [roleId, setRoleId] = useState<string | undefined>(openRoles[0]?.id);
    const [message, setMessage] = useState("");
    const [portfolioUrl, setPortfolioUrl] = useState("");
    const [hoursPerWeek, setHoursPerWeek] = useState<number | "">("");
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState("");

    const close = () => {
        setOpen(false);
        setSubmitted(false);
        setError("");
    };

    if (isOwner) return null;
    if (openRoles.length === 0) return null;

    const submit = async () => {
        if (!roleId) return;
        setSubmitting(true);
        setError("");
        try {
            await apiFetch<{ success: boolean }>(`/api/campaigns/${campaignId}/joins`, {
                method: "POST",
                body: {
                    roleId,
                    message: message || null,
                    portfolioUrl: portfolioUrl || null,
                    hoursPerWeek: hoursPerWeek === "" ? null : Number(hoursPerWeek),
                },
            });
            setSubmitted(true);
            router.refresh();
        } catch (err) {
            setError(translateApiError(tGlobal, err));
        } finally {
            setSubmitting(false);
        }
    };

    if (!isAuthed) {
        return (
            <Link
                href={`/${locale}/login?redirect=/${locale}/campaigns/${campaignSlug}`}
                className="inline-flex items-center justify-center gap-2 rounded-xl h-12 px-6 bg-primary-600 hover:bg-primary-700 text-white text-base font-bold shadow-sm transition-colors"
            >
                <Users className="w-5 h-5" />
                {t("mustSignIn")}
            </Link>
        );
    }

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className="inline-flex items-center justify-center gap-2 rounded-xl h-12 px-6 bg-primary-600 hover:bg-primary-700 text-white text-base font-bold shadow-sm transition-colors"
            >
                <Users className="w-5 h-5" />
                {tDetail("joinHeading")}
            </button>
            {open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
                    <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold">{t("title")}</h2>
                            <button onClick={close} className="p-1 text-secondary-500 hover:text-secondary-700">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {submitted ? (
                            <div className="py-8 text-center">
                                <div className="w-12 h-12 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center mx-auto mb-3">
                                    <Send className="w-6 h-6" />
                                </div>
                                <p className="font-semibold mb-4">{t("submitted")}</p>
                                <button
                                    onClick={close}
                                    className="rounded-xl h-10 px-5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-bold"
                                >
                                    OK
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-secondary-700 mb-1.5">
                                        {t("pickRole")}
                                    </label>
                                    <select
                                        value={roleId}
                                        onChange={(e) => setRoleId(e.target.value)}
                                        className="w-full rounded-xl border border-waqf-border bg-white px-3 py-2 text-sm"
                                    >
                                        {openRoles.map((r) => (
                                            <option key={r.id} value={r.id}>
                                                {r.title} ({r.skill.name})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-secondary-700 mb-1.5">
                                        {t("message")}
                                    </label>
                                    <textarea
                                        rows={4}
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        placeholder={t("messagePlaceholder")}
                                        className="w-full rounded-xl border border-waqf-border bg-white px-3 py-2 text-sm resize-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-secondary-700 mb-1.5">
                                        {t("portfolio")}
                                    </label>
                                    <input
                                        type="url"
                                        value={portfolioUrl}
                                        onChange={(e) => setPortfolioUrl(e.target.value)}
                                        className="w-full rounded-xl border border-waqf-border bg-white px-3 py-2 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-secondary-700 mb-1.5">
                                        {t("hoursPerWeek")}
                                    </label>
                                    <input
                                        type="number"
                                        min={0}
                                        max={168}
                                        value={hoursPerWeek}
                                        onChange={(e) =>
                                            setHoursPerWeek(e.target.value === "" ? "" : Number(e.target.value))
                                        }
                                        className="w-full rounded-xl border border-waqf-border bg-white px-3 py-2 text-sm"
                                    />
                                </div>
                                {error && (
                                    <p className="text-sm text-red-600 bg-red-50 rounded-lg p-2">{error}</p>
                                )}
                                <div className="flex justify-end gap-2 pt-2">
                                    <button
                                        onClick={close}
                                        className="rounded-xl h-10 px-4 text-sm font-semibold text-secondary-700 hover:bg-secondary-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={submit}
                                        disabled={submitting || !roleId}
                                        className="rounded-xl h-10 px-5 bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white text-sm font-bold inline-flex items-center gap-2"
                                    >
                                        {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                                        {t("submit")}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
