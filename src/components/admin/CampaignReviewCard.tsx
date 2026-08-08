"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import {
    CheckCircle2,
    XCircle,
    Clock,
    Eye,
    Filter,
    Search,
    AlertCircle,
    Loader2,
    X,
    Megaphone,
} from "lucide-react";
import Link from "next/link";
import { CampaignStatusBadge } from "@/components/campaigns/CampaignStatusBadge";

interface AdminCampaign {
    id: string;
    title: string;
    slug: string;
    pitch: string;
    problem: string;
    status: string;
    category: string;
    language: string;
    country: string | null;
    createdAt: string;
    owner: { id: string; name: string; email: string; image: string | null };
    organization: { id: string; name: string } | null;
    roles: Array<{
        id: string;
        title: string;
        count: number;
        filledCount: number;
        skill: { name: string; nameAr: string | null };
    }>;
    _count: { joins: number; roles: number };
}

interface Props {
    locale: string;
}

export function CampaignReviewCard({ locale }: Props) {
    const t = useTranslations("adminCampaigns");
    const tCommon = useTranslations("common");
    const isAr = locale === "ar";

    const [campaigns, setCampaigns] = useState<AdminCampaign[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<string>("PENDING");
    const [searchQuery, setSearchQuery] = useState("");
    const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 0 });
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [feedbackModal, setFeedbackModal] = useState<{
        id: string;
        action: "approve" | "reject";
        title: string;
    } | null>(null);
    const [feedback, setFeedback] = useState("");
    const [toast, setToast] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

    const fetchCampaigns = useCallback(async () => {
        try {
            setIsLoading(true);
            const params = new URLSearchParams({ page: pagination.page.toString() });
            if (statusFilter) params.set("status", statusFilter);
            const response = await fetch(`/api/admin/campaigns?${params}`);
            if (response.ok) {
                const data = await response.json();
                setCampaigns(data.campaigns);
                setPagination((p) => ({
                    ...p,
                    total: data.pagination.total,
                    totalPages: data.pagination.totalPages,
                }));
            }
        } catch (error) {
            console.error("Failed to fetch campaigns:", error);
        } finally {
            setIsLoading(false);
        }
    }, [statusFilter, pagination.page]);

    useEffect(() => {
        fetchCampaigns();
    }, [fetchCampaigns]);

    useEffect(() => {
        if (!feedbackModal) return;
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                setFeedbackModal(null);
                setFeedback("");
            }
        };
        document.addEventListener("keydown", handleKey);
        return () => document.removeEventListener("keydown", handleKey);
    }, [feedbackModal]);

    useEffect(() => {
        if (!toast) return;
        const id = setTimeout(() => setToast(null), 3000);
        return () => clearTimeout(id);
    }, [toast]);

    const submit = async () => {
        if (!feedbackModal) return;
        try {
            setActionLoading(feedbackModal.id);
            const endpoint =
                feedbackModal.action === "approve"
                    ? `/api/admin/campaigns/${feedbackModal.id}/approve`
                    : `/api/admin/campaigns/${feedbackModal.id}/reject`;
            const response = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ feedback: feedback || null }),
            });
            if (response.ok) {
                setToast({ kind: "ok", text: feedbackModal.action === "approve" ? t("approved") : t("rejected") });
                setFeedbackModal(null);
                setFeedback("");
                fetchCampaigns();
            } else {
                const data = await response.json().catch(() => ({}));
                setToast({ kind: "err", text: data?.error ?? "Failed" });
            }
        } catch {
            setToast({ kind: "err", text: "Failed" });
        } finally {
            setActionLoading(null);
        }
    };

    const filtered = campaigns.filter(
        (c) =>
            c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.owner.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const statusOptions = [
        { value: "PENDING", label: t("statusPending") },
        { value: "RECRUITING", label: t("statusRecruiting") },
        { value: "DRAFT", label: t("statusDraft") },
        { value: "READY", label: t("statusReady") },
    ];

    return (
        <div className="space-y-6">
            <header>
                <h1 className="text-2xl font-bold text-secondary-900 flex items-center gap-2">
                    <Megaphone className="w-6 h-6 text-primary-600" />
                    {t("title")}
                </h1>
                <p className="text-secondary-500 mt-1">{t("subtitle")}</p>
            </header>

            <div className="bg-white rounded-xl border border-secondary-200 p-4">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder={isAr ? "بحث..." : "Search..."}
                            className="w-full pl-10 pr-4 py-2 border border-secondary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Filter className="w-5 h-5 text-secondary-400" />
                        <select
                            value={statusFilter}
                            onChange={(e) => {
                                setStatusFilter(e.target.value);
                                setPagination((p) => ({ ...p, page: 1 }));
                            }}
                            className="px-4 py-2 border border-secondary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        >
                            {statusOptions.map((o) => (
                                <option key={o.value} value={o.value}>
                                    {o.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
                </div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-secondary-200">
                    <AlertCircle className="w-12 h-12 text-secondary-300 mx-auto mb-4" />
                    <p className="text-secondary-600">{t("noCampaigns")}</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filtered.map((c) => (
                        <div
                            key={c.id}
                            className="bg-white rounded-xl border border-secondary-200 p-6"
                        >
                            <div className="flex flex-col gap-4">
                                <div className="flex flex-col md:flex-row md:items-center gap-3">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-semibold text-secondary-900">
                                                {c.title}
                                            </h3>
                                            <CampaignStatusBadge status={c.status} />
                                        </div>
                                        <p className="text-sm text-secondary-600 line-clamp-2">
                                            {c.pitch}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        {c.status === "PENDING" && (
                                            <>
                                                <button
                                                    onClick={() =>
                                                        setFeedbackModal({
                                                            id: c.id,
                                                            action: "approve",
                                                            title: c.title,
                                                        })
                                                    }
                                                    disabled={actionLoading === c.id}
                                                    className="flex items-center gap-1 px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors disabled:opacity-50"
                                                >
                                                    <CheckCircle2 className="w-4 h-4" />
                                                    {t("approve")}
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        setFeedbackModal({
                                                            id: c.id,
                                                            action: "reject",
                                                            title: c.title,
                                                        })
                                                    }
                                                    disabled={actionLoading === c.id}
                                                    className="flex items-center gap-1 px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50"
                                                >
                                                    <XCircle className="w-4 h-4" />
                                                    {t("reject")}
                                                </button>
                                            </>
                                        )}
                                        <Link
                                            href={`/${locale}/campaigns/${c.slug}`}
                                            target="_blank"
                                            className="flex items-center gap-1 px-3 py-2 bg-secondary-100 text-secondary-700 rounded-lg hover:bg-secondary-200 transition-colors"
                                        >
                                            <Eye className="w-4 h-4" />
                                            {isAr ? "عرض" : "View"}
                                        </Link>
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-secondary-500">
                                    <span>
                                        {isAr ? "المالك:" : "Owner:"} {c.owner.name}
                                    </span>
                                    {c.organization && (
                                        <span>
                                            {isAr ? "المنظمة:" : "Org:"} {c.organization.name}
                                        </span>
                                    )}
                                    <span>{c.category}</span>
                                    <span>
                                        {c._count.roles} {isAr ? "أدوار" : "roles"} ·{" "}
                                        {c._count.joins} {t("joins")}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {new Date(c.createdAt).toLocaleDateString()}
                                    </span>
                                </div>

                                {c.roles.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5">
                                        {c.roles.map((r) => (
                                            <span
                                                key={r.id}
                                                className="px-2 py-0.5 bg-secondary-50 text-secondary-600 rounded text-xs"
                                            >
                                                {r.skill.name} · {r.filledCount}/{r.count}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {pagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2">
                    <button
                        onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}
                        disabled={pagination.page === 1}
                        className="px-4 py-2 border border-secondary-200 rounded-lg disabled:opacity-50"
                    >
                        {tCommon("previous")}
                    </button>
                    <span className="text-sm text-secondary-600">
                        {pagination.page} / {pagination.totalPages}
                    </span>
                    <button
                        onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}
                        disabled={pagination.page === pagination.totalPages}
                        className="px-4 py-2 border border-secondary-200 rounded-lg disabled:opacity-50"
                    >
                        {tCommon("next")}
                    </button>
                </div>
            )}

            {feedbackModal && (
                <div
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                    onClick={() => {
                        setFeedbackModal(null);
                        setFeedback("");
                    }}
                >
                    <div
                        className="bg-white rounded-2xl p-6 max-w-md w-full relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            type="button"
                            onClick={() => {
                                setFeedbackModal(null);
                                setFeedback("");
                            }}
                            aria-label={tCommon("cancel")}
                            className="absolute top-3 end-3 p-2 text-secondary-400 hover:text-secondary-600 hover:bg-secondary-100 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        <h3 className="text-lg font-semibold text-secondary-900 mb-1 pr-8">
                            {feedbackModal.action === "approve"
                                ? t("approve")
                                : t("reject")}
                        </h3>
                        <p className="text-sm text-secondary-500 mb-4 line-clamp-1">
                            {feedbackModal.title}
                        </p>
                        <label className="block text-xs font-semibold text-secondary-700 mb-1">
                            {t("feedbackLabel")}
                        </label>
                        <textarea
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            placeholder={t("feedbackPlaceholder")}
                            className="w-full p-3 border border-secondary-200 rounded-xl resize-none h-24 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        />
                        <div className="flex gap-3 mt-4">
                            <button
                                onClick={() => {
                                    setFeedbackModal(null);
                                    setFeedback("");
                                }}
                                className="flex-1 px-4 py-2 border border-secondary-200 rounded-lg hover:bg-secondary-50"
                            >
                                {tCommon("cancel")}
                            </button>
                            <button
                                onClick={submit}
                                disabled={actionLoading === feedbackModal.id}
                                className={`flex-1 px-4 py-2 rounded-lg text-white disabled:opacity-50 ${
                                    feedbackModal.action === "approve"
                                        ? "bg-green-600 hover:bg-green-700"
                                        : "bg-red-600 hover:bg-red-700"
                                }`}
                            >
                                {actionLoading === feedbackModal.id ? (
                                    <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                                ) : feedbackModal.action === "approve" ? (
                                    t("approve")
                                ) : (
                                    t("reject")
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {toast && (
                <div
                    className={`fixed bottom-6 end-6 z-50 px-4 py-3 rounded-xl shadow-lg text-sm font-semibold ${
                        toast.kind === "ok"
                            ? "bg-emerald-600 text-white"
                            : "bg-red-600 text-white"
                    }`}
                >
                    {toast.text}
                </div>
            )}
        </div>
    );
}
