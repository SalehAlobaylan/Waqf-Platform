"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { Check, X, Loader2, Megaphone, ChevronRight } from "lucide-react";
import { CampaignStatusBadge } from "@/components/campaigns/CampaignStatusBadge";
import { CampaignOverallProgress } from "@/components/campaigns/ProgressBar";
import { apiFetch } from "@/lib/api/client";
import { toast } from "@/lib/toast";
import { translateApiError } from "@/lib/i18n/client-errors";

export interface OwnerCampaignItem {
    id: string;
    slug: string;
    title: string;
    pitch: string;
    status: string;
    roles: Array<{ id: string; count: number; filledCount: number }>;
    _count: { joins: number };
}

interface Props {
    campaigns: OwnerCampaignItem[];
    joinsByCampaign: Record<
        string,
        Array<{
            id: string;
            status: string;
            message: string | null;
            portfolioUrl: string | null;
            hoursPerWeek: number | null;
            contributor: { id: string; name: string; username: string | null; image: string | null };
            role: { id: string; title: string };
        }>
    >;
}

export function DashboardCampaignsClient({ campaigns, joinsByCampaign }: Props) {
    const t = useTranslations("dashboardCampaigns");
    const tGlobal = useTranslations();
    const locale = useLocale();
    const router = useRouter();
    const [openId, setOpenId] = useState<string | null>(null);
    const [busy, setBusy] = useState<string | null>(null);
    const [, startTransition] = useTransition();

    const decide = async (joinId: string, status: "ACCEPTED" | "REJECTED", campaignId: string) => {
        setBusy(joinId);
        try {
            await apiFetch(`/api/campaigns/${campaignId}/joins/${joinId}`, {
                method: "PUT",
                body: { status },
            });
            startTransition(() => router.refresh());
        } catch (error) {
            toast.error(translateApiError(tGlobal, error));
        } finally {
            setBusy(null);
        }
    };

    if (campaigns.length === 0) {
        return (
            <div className="max-w-3xl mx-auto px-4 py-16 text-center">
                <Megaphone className="w-12 h-12 text-secondary-300 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-secondary-700 mb-2">
                    {t("noCampaigns")}
                </h2>
                <p className="text-secondary-500 mb-6">{t("noCampaignsDescription")}</p>
                <Link
                    href={`/${locale}/campaigns/new`}
                    className="inline-flex items-center gap-2 rounded-xl h-11 px-5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-bold"
                >
                    <Megaphone className="w-4 h-4" />
                    {t("startCampaign")}
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-[1280px] mx-auto px-4 md:px-10 py-10">
            <header className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-secondary-900">
                        {t("title")}
                    </h1>
                    <p className="text-sm text-secondary-500">{t("subtitle")}</p>
                </div>
                <Link
                    href={`/${locale}/campaigns/new`}
                    className="inline-flex items-center gap-2 rounded-xl h-11 px-5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-bold"
                >
                    <Megaphone className="w-4 h-4" />
                    {t("startCampaign")}
                </Link>
            </header>

            <div className="space-y-3">
                {campaigns.map((c) => {
                    const totalSeats = c.roles.reduce((s, r) => s + r.count, 0);
                    const filled = c.roles.reduce((s, r) => s + Math.min(r.filledCount, r.count), 0);
                    const isOpen = openId === c.id;
                    const joins = joinsByCampaign[c.id] ?? [];
                    return (
                        <div
                            key={c.id}
                            className="rounded-2xl border border-waqf-border bg-white overflow-hidden"
                        >
                            <div className="p-5 flex flex-col md:flex-row md:items-center gap-4">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <CampaignStatusBadge status={c.status} />
                                        {c._count.joins > 0 && (
                                            <span className="text-xs text-secondary-500">
                                                {c._count.joins}{" "}
                                                {t("submissions").toLowerCase()}
                                            </span>
                                        )}
                                    </div>
                                    <Link
                                        href={`/${locale}/campaigns/${c.slug}`}
                                        className="font-bold text-secondary-900 hover:text-primary-700"
                                    >
                                        {c.title}
                                    </Link>
                                    <p className="text-sm text-secondary-500 line-clamp-1 mt-0.5">
                                        {c.pitch}
                                    </p>
                                </div>
                                <div className="w-full md:w-48">
                                    <CampaignOverallProgress
                                        percent={
                                            totalSeats > 0
                                                ? Math.round((filled / totalSeats) * 100)
                                                : 0
                                        }
                                    />
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <Link
                                        href={`/${locale}/campaigns/${c.slug}/edit`}
                                        className="rounded-xl h-9 px-3 text-xs font-bold border border-waqf-border bg-white hover:bg-secondary-50"
                                    >
                                        {t("edit")}
                                    </Link>
                                    <button
                                        onClick={() => setOpenId(isOpen ? null : c.id)}
                                        className="rounded-xl h-9 px-3 text-xs font-bold bg-primary-600 hover:bg-primary-700 text-white inline-flex items-center gap-1"
                                    >
                                        {t("viewJoins")} ({joins.length})
                                        <ChevronRight
                                            className={`w-3.5 h-3.5 transition-transform ${isOpen ? "rotate-90" : ""}`}
                                        />
                                    </button>
                                </div>
                            </div>

                            {isOpen && (
                                <div className="border-t border-waqf-border bg-waqf-bg/40 p-5 space-y-2">
                                    {joins.length === 0 ? (
                                        <p className="text-sm text-secondary-500 text-center py-2">
                                            {t("noJoins")}
                                        </p>
                                    ) : (
                                        joins.map((j) => (
                                            <div
                                                key={j.id}
                                                className="flex items-start gap-3 rounded-xl bg-white border border-waqf-border p-3"
                                            >
                                                <div className="w-9 h-9 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-sm font-bold shrink-0">
                                                    {j.contributor.name[0]?.toUpperCase()}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-semibold text-sm">
                                                        {j.contributor.name}
                                                    </p>
                                                    <p className="text-xs text-secondary-500">
                                                        {j.role.title}
                                                        {j.hoursPerWeek
                                                            ? ` · ${j.hoursPerWeek}h/week`
                                                            : ""}
                                                    </p>
                                                    {j.message && (
                                                        <p className="text-sm text-secondary-700 mt-1.5 line-clamp-2">
                                                            {j.message}
                                                        </p>
                                                    )}
                                                    {j.portfolioUrl && (
                                                        <a
                                                            href={j.portfolioUrl}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="text-xs text-primary-700 hover:underline"
                                                        >
                                                            {j.portfolioUrl}
                                                        </a>
                                                    )}
                                                </div>
                                                {j.status === "PENDING" ? (
                                                    <div className="flex gap-1 shrink-0">
                                                        <button
                                                            onClick={() =>
                                                                decide(j.id, "ACCEPTED", c.id)
                                                            }
                                                            disabled={busy === j.id}
                                                            className="rounded-lg px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold inline-flex items-center gap-1"
                                                        >
                                                            {busy === j.id ? (
                                                                <Loader2 className="w-3 h-3 animate-spin" />
                                                            ) : (
                                                                <Check className="w-3 h-3" />
                                                            )}
                                                            {t("approve")}
                                                        </button>
                                                        <button
                                                            onClick={() =>
                                                                decide(j.id, "REJECTED", c.id)
                                                            }
                                                            disabled={busy === j.id}
                                                            className="rounded-lg px-2.5 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-bold inline-flex items-center gap-1"
                                                        >
                                                            <X className="w-3 h-3" />
                                                            {t("reject")}
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs font-semibold text-secondary-500 shrink-0">
                                                        {j.status === "ACCEPTED"
                                                            ? t("approved")
                                                            : j.status === "REJECTED"
                                                                ? t("rejected")
                                                                : t("withdrawn")}
                                                    </span>
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
