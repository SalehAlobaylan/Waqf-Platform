"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { Loader2, X, Megaphone, Clock, CheckCircle, XCircle, Hourglass } from "lucide-react";
import { CampaignStatusBadge } from "@/components/campaigns/CampaignStatusBadge";

export interface MyJoinItem {
    id: string;
    status: "PENDING" | "ACCEPTED" | "REJECTED" | "WITHDRAWN";
    createdAt: string;
    message: string | null;
    hoursPerWeek: number | null;
    role: { id: string; title: string; seniority: string };
    campaign: {
        id: string;
        slug: string;
        title: string;
        status: string;
        pitch: string;
    };
}

interface Props {
    joins: MyJoinItem[];
}

export function DashboardCampaignJoinsClient({ joins }: Props) {
    const t = useTranslations("dashboardCampaignJoins");
    const locale = useLocale();
    const router = useRouter();
    const [busy, setBusy] = useState<string | null>(null);
    const [, startTransition] = useTransition();

    const withdraw = async (joinId: string) => {
        setBusy(joinId);
        try {
            const join = joins.find((j) => j.id === joinId);
            if (!join) return;
            await fetch(`/api/campaigns/${join.campaign.id}/joins/${joinId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: "WITHDRAWN" }),
            });
            startTransition(() => router.refresh());
        } finally {
            setBusy(null);
        }
    };

    if (joins.length === 0) {
        return (
            <div className="max-w-3xl mx-auto px-4 py-16 text-center">
                <Megaphone className="w-12 h-12 text-secondary-300 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-secondary-700 mb-2">
                    {t("noJoins")}
                </h2>
                <p className="text-secondary-500 mb-6">{t("noJoinsDescription")}</p>
                <Link
                    href={`/${locale}/campaigns`}
                    className="inline-flex items-center gap-2 rounded-xl h-11 px-5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-bold"
                >
                    {t("viewCampaign")}
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-[1280px] mx-auto px-4 md:px-10 py-10">
            <header className="mb-8">
                <h1 className="text-2xl md:text-3xl font-black text-secondary-900">
                    {t("title")}
                </h1>
                <p className="text-sm text-secondary-500">{t("subtitle")}</p>
            </header>

            <div className="space-y-3">
                {joins.map((j) => {
                    const canWithdraw =
                        (j.status === "PENDING" || j.status === "ACCEPTED") &&
                        (j.campaign.status === "DRAFT" ||
                            j.campaign.status === "RECRUITING");
                    return (
                        <div
                            key={j.id}
                            className="rounded-2xl border border-waqf-border bg-white p-5 flex flex-col md:flex-row md:items-center gap-4"
                        >
                            <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                    <CampaignStatusBadge status={j.campaign.status} />
                                    <JoinStatusBadge status={j.status} />
                                </div>
                                <Link
                                    href={`/${locale}/campaigns/${j.campaign.slug}`}
                                    className="font-bold text-secondary-900 hover:text-primary-700"
                                >
                                    {j.campaign.title}
                                </Link>
                                <p className="text-sm text-secondary-500 line-clamp-1 mt-0.5">
                                    {j.campaign.pitch}
                                </p>
                                <p className="text-xs text-secondary-400 mt-1.5">
                                    {j.role.title}
                                    {j.hoursPerWeek ? ` · ${j.hoursPerWeek}h/week` : ""}
                                </p>
                                {j.message && (
                                    <p className="text-sm text-secondary-700 mt-2 line-clamp-2">
                                        {j.message}
                                    </p>
                                )}
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                <Link
                                    href={`/${locale}/campaigns/${j.campaign.slug}`}
                                    className="rounded-xl h-9 px-3 text-xs font-bold border border-waqf-border bg-white hover:bg-secondary-50"
                                >
                                    {t("viewCampaign")}
                                </Link>
                                {canWithdraw && (
                                    <button
                                        onClick={() => withdraw(j.id)}
                                        disabled={busy === j.id}
                                        className="rounded-xl h-9 px-3 text-xs font-bold bg-red-50 text-red-600 hover:bg-red-100 inline-flex items-center gap-1 disabled:opacity-50"
                                    >
                                        {busy === j.id ? (
                                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                        ) : (
                                            <X className="w-3.5 h-3.5" />
                                        )}
                                        {t("withdraw")}
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function JoinStatusBadge({ status }: { status: MyJoinItem["status"] }) {
    const map: Record<MyJoinItem["status"], { icon: typeof Clock; color: string; label: string }> = {
        PENDING: { icon: Hourglass, color: "bg-amber-100 text-amber-700", label: "Pending" },
        ACCEPTED: { icon: CheckCircle, color: "bg-emerald-100 text-emerald-700", label: "Accepted" },
        REJECTED: { icon: XCircle, color: "bg-red-100 text-red-600", label: "Rejected" },
        WITHDRAWN: { icon: XCircle, color: "bg-secondary-100 text-secondary-500", label: "Withdrawn" },
    };
    const m = map[status];
    const Icon = m.icon;
    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${m.color}`}>
            <Icon className="w-3 h-3" />
            {m.label}
        </span>
    );
}
