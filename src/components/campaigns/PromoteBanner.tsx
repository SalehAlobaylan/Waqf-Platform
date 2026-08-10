"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Loader2, Rocket, X } from "lucide-react";
import { apiFetch } from "@/lib/api/client";
import { translateApiError } from "@/lib/i18n/client-errors";

interface Props {
    campaignId: string;
    projectSlug: string | null;
    isReadyEligible: boolean;
    isOwner: boolean;
    status: string;
}

export function PromoteBanner({ campaignId, projectSlug, isReadyEligible, isOwner, status }: Props) {
    const t = useTranslations("campaigns");
    const tGlobal = useTranslations();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [dismissed, setDismissed] = useState(false);

    if (status === "READY" && projectSlug) {
        return (
            <div className="rounded-2xl border-2 border-emerald-300 bg-emerald-50 p-5 flex items-center justify-between gap-4">
                <div>
                    <h3 className="font-bold text-emerald-800">{t("detail.promotedHeading")}</h3>
                    <p className="text-sm text-emerald-700 mt-0.5">{t("detail.promotedSubtitle")}</p>
                </div>
                <a
                    href={`/projects/${projectSlug}`}
                    className="rounded-xl h-10 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold inline-flex items-center gap-1.5"
                >
                    <Rocket className="w-4 h-4" />
                    {t("detail.viewProject")}
                </a>
            </div>
        );
    }

    if (!isOwner || !isReadyEligible || dismissed) return null;

    const promote = async () => {
        setLoading(true);
        setError("");
        try {
            await apiFetch(`/api/campaigns/${campaignId}/promote`, { method: "POST" });
            router.refresh();
        } catch (err) {
            setError(translateApiError(tGlobal, err));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="rounded-2xl border-2 border-primary-200 bg-primary-50/50 p-5 flex items-start justify-between gap-4">
            <div>
                <h3 className="font-bold text-primary-800">{t("detail.promote")}</h3>
                <p className="text-sm text-primary-700 mt-0.5">{t("detail.promoteHint")}</p>
                {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
            </div>
            <div className="flex items-center gap-2 shrink-0">
                <button
                    onClick={() => setDismissed(true)}
                    className="p-1.5 rounded-lg text-primary-600 hover:bg-primary-100"
                    aria-label="Dismiss"
                >
                    <X className="w-4 h-4" />
                </button>
                <button
                    onClick={promote}
                    disabled={loading}
                    className="rounded-xl h-10 px-4 bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white text-sm font-bold inline-flex items-center gap-1.5"
                >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Rocket className="w-4 h-4" />}
                    {t("detail.promote")}
                </button>
            </div>
        </div>
    );
}
