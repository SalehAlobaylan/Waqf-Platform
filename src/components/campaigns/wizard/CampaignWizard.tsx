"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import {
    ChevronLeft,
    ChevronRight,
    Loader2,
    Megaphone,
    Save,
    Send,
    MapPin,
    CircleCheckBig,
    BookOpen,
    Globe,
    Users,
    Mail,
    Building2,
    Calendar,
} from "lucide-react";
import { useCampaignDraft } from "@/components/campaigns/wizard/useCampaignDraft";
import { RoleBuilder } from "@/components/campaigns/wizard/RoleBuilder";
import { apiFetch } from "@/lib/api/client";
import { translateApiError } from "@/lib/i18n/client-errors";

const STEPS = 5;

export interface CampaignWizardProps {
    locale: string;
    mode: "create" | "edit";
    initialData?: {
        id: string;
        title: string;
        pitch: string;
        problem: string;
        outcome: string | null;
        category: string;
        language: string;
        country: string | null;
        contactEmail: string | null;
        organizationId: string | null;
        recruitmentDeadline: string | null;
        startsAt: string | null;
        slug: string;
        status: string;
        roles: Array<{
            id: string;
            skillId: number;
            title: string;
            description: string | null;
            count: number;
            seniority: "JUNIOR" | "MID" | "SENIOR" | "ANY";
            isRequired: boolean;
            skill: { name: string };
        }>;
        milestones: Array<{ id: string; title: string; description: string | null }>;
    };
    organizations: Array<{ id: string; name: string }>;
}

const CATEGORIES = [
    { value: "QURAN", icon: BookOpen, color: "bg-indigo-50 text-indigo-700 border-indigo-200", activeColor: "bg-indigo-600 border-indigo-600 text-white" },
    { value: "PRAYER", icon: Globe, color: "bg-emerald-50 text-emerald-700 border-emerald-200", activeColor: "bg-emerald-600 border-emerald-600 text-white" },
    { value: "CHARITY", icon: Megaphone, color: "bg-amber-50 text-amber-700 border-amber-200", activeColor: "bg-amber-600 border-amber-600 text-white" },
    { value: "EDUCATION", icon: BookOpen, color: "bg-blue-50 text-blue-700 border-blue-200", activeColor: "bg-blue-600 border-blue-600 text-white" },
    { value: "COMMUNITY", icon: Users, color: "bg-purple-50 text-purple-700 border-purple-200", activeColor: "bg-purple-600 border-purple-600 text-white" },
    { value: "TOOLS", icon: Megaphone, color: "bg-slate-50 text-slate-700 border-slate-200", activeColor: "bg-slate-600 border-slate-600 text-white" },
] as const;

const CATEGORY_I18N: Record<string, { en: string; ar: string }> = {
    QURAN: { en: "Quran", ar: "القرآن الكريم" },
    PRAYER: { en: "Prayer", ar: "الصلاة" },
    CHARITY: { en: "Charity", ar: "الزكاة والصدقات" },
    EDUCATION: { en: "Education", ar: "التعليم" },
    COMMUNITY: { en: "Community", ar: "المجتمع" },
    TOOLS: { en: "Tools", ar: "الأدوات" },
};

const LANGUAGES = [
    { value: "ARABIC", en: "Arabic", ar: "العربية" },
    { value: "ENGLISH", en: "English", ar: "الإنجليزية" },
    { value: "BOTH", en: "Both", ar: "الاثنتان" },
];

export function CampaignWizard({ locale, mode, initialData, organizations }: CampaignWizardProps) {
    const t = useTranslations("campaigns.wizard");
    const tGlobal = useTranslations();
    const router = useRouter();
    const isAr = locale === "ar";

    const step = useCampaignDraft((s) => s.step);
    const setStep = useCampaignDraft((s) => s.setStep);
    const draft = useCampaignDraft((s) => s.draft);
    const hydrate = useCampaignDraft((s) => s.hydrate);

    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useState(() => {
        if (mode === "edit" && initialData) {
            hydrate({
                id: initialData.id,
                title: initialData.title,
                pitch: initialData.pitch,
                problem: initialData.problem,
                outcome: initialData.outcome ?? "",
                category: initialData.category,
                language: (initialData.language as "ARABIC" | "ENGLISH" | "BOTH") ?? "BOTH",
                country: initialData.country ?? "",
                contactEmail: initialData.contactEmail ?? "",
                organizationId: initialData.organizationId ?? "",
                recruitmentDeadline: initialData.recruitmentDeadline
                    ? new Date(initialData.recruitmentDeadline).toISOString().slice(0, 10)
                    : "",
                startsAt: initialData.startsAt
                    ? new Date(initialData.startsAt).toISOString().slice(0, 10)
                    : "",
                roles: initialData.roles.map((r) => ({
                    tempId: r.id,
                    persistedId: r.id,
                    skillId: r.skillId,
                    skillName: r.skill.name,
                    title: r.title,
                    description: r.description ?? "",
                    count: r.count,
                    seniority: r.seniority,
                    isRequired: r.isRequired,
                })),
                milestones: initialData.milestones.map((m) => ({
                    tempId: m.id,
                    persistedId: m.id,
                    title: m.title,
                    description: m.description ?? "",
                })),
            });
        }
        return null;
    });

    const validateStep = (s: number): string | null => {
        if (s === 0) {
            if (draft.title.trim().length < 2) return "Give your idea a short title (at least 2 characters).";
            if (draft.pitch.trim().length < 10) return "Write a brief pitch so people get the idea (at least 10 characters).";
            if (draft.problem.trim().length < 10) return "Describe the problem you're solving (at least 10 characters).";
        }
        if (s === 2) {
            if (draft.roles.length > 0) {
                for (const r of draft.roles) {
                    if (!r.skillId) return "Every role needs a skill — pick one from the list.";
                    if (!r.title.trim()) return "Give each role a short title.";
                    if (r.count < 1) return "Each role needs at least 1 seat.";
                }
            }
        }
        return null;
    };

    const next = () => {
        const err = validateStep(step);
        if (err) {
            setError(err);
            return;
        }
        setError("");
        setStep(Math.min(STEPS - 1, step + 1));
    };

    const prev = () => {
        setError("");
        setStep(Math.max(0, step - 1));
    };

    const saveDraft = async () => {
        setSubmitting(true);
        setError("");
        setSuccess("");
        try {
            const body = buildPayload();
            const url = mode === "edit" ? `/api/campaigns/${initialData!.id}` : "/api/campaigns";
            const method = mode === "edit" ? "PUT" : "POST";
            const created = await apiFetch<{ slug: string }>(url, { method, body });
            setSuccess(t("savedDraft"));
            if (mode === "create") {
                router.push(`/${locale}/campaigns/${created.slug}/edit`);
            } else {
                router.refresh();
            }
        } catch (err) {
            setError(translateApiError(tGlobal, err));
        } finally {
            setSubmitting(false);
        }
    };

    const submitForReview = async () => {
        const err = validateStep(0) ?? validateStep(2);
        if (err) {
            setError(err);
            return;
        }
        if (draft.roles.length === 0) {
            setError("Add at least one role before submitting for review.");
            return;
        }
        setSubmitting(true);
        setError("");
        setSuccess("");
        try {
            const body = buildPayload();
            let campaignId = initialData?.id;
            if (!campaignId) {
                const created = await apiFetch<{ id: string }>("/api/campaigns", {
                    method: "POST",
                    body,
                });
                campaignId = created.id;
            } else {
                await apiFetch<{ id: string }>(`/api/campaigns/${campaignId}`, {
                    method: "PUT",
                    body,
                });
            }

            await apiFetch<{ id: string }>(`/api/campaigns/${campaignId}/submit`, { method: "POST" });
            setSuccess(t("submitted"));
            router.push(`/${locale}/dashboard/campaigns`);
        } catch (err) {
            setError(translateApiError(tGlobal, err));
        } finally {
            setSubmitting(false);
        }
    };

    const buildPayload = () => {
        const rolesForApi = draft.roles
            .filter((r) => r.skillId && r.title.trim().length >= 1)
            .map((r) => ({
                skillId: r.skillId!,
                title: r.title.trim(),
                description: r.description.trim() || null,
                count: r.count,
                seniority: r.seniority,
                isRequired: r.isRequired,
            }));
        return {
            title: draft.title,
            pitch: draft.pitch,
            problem: draft.problem,
            outcome: draft.outcome.trim() || null,
            category: draft.category,
            language: draft.language,
            country: draft.country.trim() || null,
            contactEmail: draft.contactEmail.trim() || null,
            organizationId: draft.organizationId || null,
            startsAt: draft.startsAt || null,
            recruitmentDeadline: draft.recruitmentDeadline || null,
            roles: rolesForApi,
        };
    };

    const stepLabels = isAr
        ? ["الفكرة", "المكان والفئات", "الأدوار", "الجدول", "المراجعة"]
        : ["Idea", "Where & Who", "Roles", "Timeline", "Review"];

    return (
        <div className="max-w-3xl mx-auto px-4 md:px-10 py-10">
            {/* Header */}
            <header className="mb-8">
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 text-white flex items-center justify-center shadow-lg shadow-primary-600/20">
                        <Megaphone className="w-5 h-5" />
                    </div>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-black tracking-tight text-secondary-900">
                            {mode === "edit" ? t("editTitle") : t("title")}
                        </h1>
                        <p className="text-xs text-secondary-400 font-medium mt-0.5">
                            {t("step", { current: step + 1, total: STEPS })}
                        </p>
                    </div>
                </div>

                {/* Step progress */}
                <div className="mt-5">
                    <div className="flex items-center justify-between mb-2">
                        {stepLabels.map((label, i) => {
                            const isActive = i === step;
                            const isDone = i < step;
                            return (
                                <button
                                    key={i}
                                    type="button"
                                    onClick={() => {
                                        if (i < step) {
                                            setError("");
                                            setStep(i);
                                        }
                                    }}
                                    disabled={i > step}
                                    className={`flex items-center gap-1.5 text-xs font-semibold transition-colors ${
                                        isActive
                                            ? "text-primary-700"
                                            : isDone
                                                ? "text-primary-500 cursor-pointer hover:text-primary-600"
                                                : "text-secondary-300"
                                    }`}
                                >
                                    <span
                                        className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors ${
                                            isActive
                                                ? "bg-primary-600 text-white"
                                                : isDone
                                                    ? "bg-primary-100 text-primary-700"
                                                    : "bg-secondary-100 text-secondary-400"
                                        }`}
                                    >
                                        {isDone ? "✓" : i + 1}
                                    </span>
                                    <span className="hidden sm:inline">{label}</span>
                                </button>
                            );
                        })}
                    </div>
                    <div className="h-1.5 bg-secondary-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full transition-all duration-500 ease-out"
                            style={{ width: `${((step + 1) / STEPS) * 100}%` }}
                        />
                    </div>
                </div>
            </header>

            {/* Step content */}
            <div className="rounded-2xl border border-secondary-200 bg-white shadow-sm overflow-hidden">
                <div className="p-6 md:p-8">
                    {step === 0 && <Step1 />}
                    {step === 1 && <Step2 organizations={organizations} />}
                    {step === 2 && <Step3 />}
                    {step === 3 && <Step4 />}
                    {step === 4 && <Step5 />}
                </div>
            </div>

            {/* Toasts */}
            {error && (
                <div className="mt-4 flex items-start gap-2 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                    <span className="mt-0.5 shrink-0">⚠</span>
                    <span>{error}</span>
                </div>
            )}
            {success && (
                <div className="mt-4 flex items-start gap-2 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700">
                    <CircleCheckBig className="w-4 h-4 mt-0.5 shrink-0" />
                    <span>{success}</span>
                </div>
            )}

            {/* Actions */}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                <button
                    type="button"
                    onClick={prev}
                    disabled={step === 0}
                    className="rounded-xl h-11 px-4 inline-flex items-center gap-1.5 text-sm font-semibold text-secondary-600 hover:bg-secondary-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                    <ChevronLeft className="w-4 h-4 rtl:rotate-180" />
                    {t("previous")}
                </button>
                <div className="flex items-center gap-2.5">
                    <button
                        type="button"
                        onClick={saveDraft}
                        disabled={submitting}
                        className="rounded-xl h-11 px-5 border border-secondary-200 bg-white hover:bg-secondary-50 text-sm font-bold text-secondary-600 inline-flex items-center gap-1.5 transition-colors disabled:opacity-50"
                    >
                        {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {t("saveDraft")}
                    </button>
                    {step < STEPS - 1 ? (
                        <button
                            type="button"
                            onClick={next}
                            className="rounded-xl h-11 px-6 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white text-sm font-bold inline-flex items-center gap-1.5 shadow-md shadow-primary-600/20 transition-all hover:shadow-lg"
                        >
                            {t("next")}
                            <ChevronRight className="w-4 h-4 rtl:rotate-180" />
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={submitForReview}
                            disabled={submitting}
                            className="rounded-xl h-11 px-6 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white text-sm font-bold inline-flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all hover:shadow-lg disabled:opacity-50"
                        >
                            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                            {t("submit")}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

/* ───── Step 1: Idea ───── */
function Step1() {
    const t = useTranslations("campaigns.wizard.step1");
    const locale = useLocale();
    const isAr = locale === "ar";
    const draft = useCampaignDraft((s) => s.draft);
    const update = useCampaignDraft((s) => s.update);
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-bold text-secondary-900 mb-1">{t("title")}</h2>
                <p className="text-sm text-secondary-500">{t("description")}</p>
            </div>
            <Field label={t("titleLabel")} hint={isAr ? "قصيرة وواضحة" : "Short and clear"}>
                <input
                    type="text"
                    value={draft.title}
                    onChange={(e) => update({ title: e.target.value })}
                    placeholder={t("titlePlaceholder")}
                    className="w-full rounded-xl border border-secondary-200 bg-white px-4 py-2.5 text-sm text-secondary-900 placeholder:text-secondary-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
                />
            </Field>
            <Field label={t("pitchLabel")} hint={isAr ? "فقرة قصيرة" : "One-liner"}>
                <textarea
                    rows={2}
                    value={draft.pitch}
                    onChange={(e) => update({ pitch: e.target.value })}
                    placeholder={t("pitchPlaceholder")}
                    className="w-full rounded-xl border border-secondary-200 bg-white px-4 py-2.5 text-sm text-secondary-900 placeholder:text-secondary-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all resize-none"
                />
            </Field>
            <Field label={t("problemLabel")} hint={isAr ? "التحدي الذي تحله" : "The challenge you solve"}>
                <textarea
                    rows={4}
                    value={draft.problem}
                    onChange={(e) => update({ problem: e.target.value })}
                    placeholder={t("problemPlaceholder")}
                    className="w-full rounded-xl border border-secondary-200 bg-white px-4 py-2.5 text-sm text-secondary-900 placeholder:text-secondary-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all resize-none"
                />
            </Field>
            <Field label={t("outcomeLabel")} hint={isAr ? "اختياري" : "Optional"}>
                <textarea
                    rows={3}
                    value={draft.outcome}
                    onChange={(e) => update({ outcome: e.target.value })}
                    placeholder={t("outcomePlaceholder")}
                    className="w-full rounded-xl border border-secondary-200 bg-white px-4 py-2.5 text-sm text-secondary-900 placeholder:text-secondary-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all resize-none"
                />
            </Field>
            <Field label={isAr ? "الفئة (اختياري)" : "Category (optional)"}>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
                    {CATEGORIES.map((c) => {
                        const Icon = c.icon;
                        const active = draft.category === c.value;
                        const label = isAr ? CATEGORY_I18N[c.value].ar : CATEGORY_I18N[c.value].en;
                        return (
                            <button
                                type="button"
                                key={c.value}
                                onClick={() => update({ category: active ? "" : c.value })}
                                className={`flex items-center gap-2.5 rounded-xl px-3.5 py-3 text-sm font-semibold border transition-all ${
                                    active
                                        ? `${c.activeColor} shadow-sm`
                                        : `${c.color} hover:shadow-sm`
                                }`}
                            >
                                <Icon className="w-4 h-4 shrink-0" />
                                {label}
                            </button>
                        );
                    })}
                </div>
            </Field>
        </div>
    );
}

/* ───── Step 2: Where & Who ───── */
function Step2({ organizations }: { organizations: Array<{ id: string; name: string }> }) {
    const t = useTranslations("campaigns.wizard.step2");
    const locale = useLocale();
    const isAr = locale === "ar";
    const draft = useCampaignDraft((s) => s.draft);
    const update = useCampaignDraft((s) => s.update);
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-bold text-secondary-900 mb-1">{t("title")}</h2>
                <p className="text-sm text-secondary-500">{t("description")}</p>
            </div>
            <Field label={t("country")} icon={<MapPin className="w-4 h-4" />}>
                <input
                    type="text"
                    value={draft.country}
                    onChange={(e) => update({ country: e.target.value })}
                    placeholder={t("countryPlaceholder")}
                    className="w-full rounded-xl border border-secondary-200 bg-white px-4 py-2.5 text-sm text-secondary-900 placeholder:text-secondary-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
                />
            </Field>
            <Field label={t("contactEmail")} icon={<Mail className="w-4 h-4" />}>
                <input
                    type="email"
                    value={draft.contactEmail}
                    onChange={(e) => update({ contactEmail: e.target.value })}
                    placeholder={isAr ? "you@example.com" : "you@example.com"}
                    className="w-full rounded-xl border border-secondary-200 bg-white px-4 py-2.5 text-sm text-secondary-900 placeholder:text-secondary-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
                />
            </Field>
            <Field label={t("organization")} icon={<Building2 className="w-4 h-4" />}>
                <select
                    value={draft.organizationId}
                    onChange={(e) => update({ organizationId: e.target.value })}
                    className="w-full rounded-xl border border-secondary-200 bg-white px-4 py-2.5 text-sm text-secondary-900 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
                >
                    <option value="">{t("noOrganization")}</option>
                    {organizations.map((o) => (
                        <option key={o.id} value={o.id}>
                            {o.name}
                        </option>
                    ))}
                </select>
            </Field>
            <Field label={t("language")} icon={<Globe className="w-4 h-4" />}>
                <div className="grid grid-cols-3 gap-2.5">
                    {LANGUAGES.map((l) => (
                        <button
                            type="button"
                            key={l.value}
                            onClick={() => update({ language: l.value as "ARABIC" | "ENGLISH" | "BOTH" })}
                            className={`rounded-xl px-3 py-2.5 text-sm font-semibold border transition-all ${
                                draft.language === l.value
                                    ? "bg-primary-600 border-primary-600 text-white shadow-sm"
                                    : "bg-white border-secondary-200 text-secondary-700 hover:border-primary-300 hover:shadow-sm"
                            }`}
                        >
                            {l.en}
                        </button>
                    ))}
                </div>
            </Field>
        </div>
    );
}

/* ───── Step 3: Roles ───── */
function Step3() {
    const t = useTranslations("campaigns.wizard.step3");
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-bold text-secondary-900 mb-1">{t("title")}</h2>
                <p className="text-sm text-secondary-500">{t("description")}</p>
            </div>
            <RoleBuilder />
        </div>
    );
}

/* ───── Step 4: Timeline & Milestones ───── */
function Step4() {
    const t = useTranslations("campaigns.wizard.step4");
    const locale = useLocale();
    const isAr = locale === "ar";
    const draft = useCampaignDraft((s) => s.draft);
    const update = useCampaignDraft((s) => s.update);
    const addMilestone = useCampaignDraft((s) => s.addMilestone);
    const setMilestone = useCampaignDraft((s) => s.setMilestone);
    const removeMilestone = useCampaignDraft((s) => s.removeMilestone);
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-bold text-secondary-900 mb-1">{t("title")}</h2>
                <p className="text-sm text-secondary-500">{t("description")}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label={t("startsAt")} icon={<Calendar className="w-4 h-4" />}>
                    <input
                        type="date"
                        value={draft.startsAt}
                        onChange={(e) => update({ startsAt: e.target.value })}
                        className="w-full rounded-xl border border-secondary-200 bg-white px-4 py-2.5 text-sm text-secondary-900 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
                    />
                </Field>
                <Field label={t("deadline")} icon={<Calendar className="w-4 h-4" />}>
                    <input
                        type="date"
                        value={draft.recruitmentDeadline}
                        onChange={(e) => update({ recruitmentDeadline: e.target.value })}
                        className="w-full rounded-xl border border-secondary-200 bg-white px-4 py-2.5 text-sm text-secondary-900 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
                    />
                </Field>
            </div>
            <div>
                <h3 className="text-sm font-bold text-secondary-700 mb-3">{t("milestones")}</h3>
                {draft.milestones.length === 0 && (
                    <div className="rounded-xl border border-dashed border-secondary-200 bg-secondary-50/50 p-6 text-center">
                        <p className="text-sm text-secondary-400">{isAr ? "لا توجد مراحل بعد" : "No milestones yet"}</p>
                    </div>
                )}
                <ul className="space-y-2.5 mb-3">
                    {draft.milestones.map((m, i) => (
                        <li
                            key={m.tempId}
                            className="flex items-start gap-3 rounded-xl border border-secondary-200 bg-secondary-50/30 p-3.5 group hover:border-secondary-300 transition-colors"
                        >
                            <span className="shrink-0 w-6 h-6 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-[10px] font-bold mt-0.5">
                                {i + 1}
                            </span>
                            <div className="flex-1 space-y-2 min-w-0">
                                <input
                                    type="text"
                                    value={m.title}
                                    onChange={(e) => setMilestone(m.tempId, { title: e.target.value })}
                                    placeholder={t("milestoneTitlePlaceholder")}
                                    className="w-full rounded-lg border border-secondary-200 bg-white px-3 py-2 text-sm text-secondary-900 placeholder:text-secondary-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
                                />
                                <input
                                    type="text"
                                    value={m.description}
                                    onChange={(e) => setMilestone(m.tempId, { description: e.target.value })}
                                    placeholder={t("milestoneDescriptionPlaceholder")}
                                    className="w-full rounded-lg border border-secondary-200 bg-white px-3 py-2 text-sm text-secondary-600 placeholder:text-secondary-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
                                />
                            </div>
                            <button
                                type="button"
                                onClick={() => removeMilestone(m.tempId)}
                                className="text-secondary-300 hover:text-red-500 px-1.5 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                                aria-label="Remove milestone"
                            >
                                ✕
                            </button>
                        </li>
                    ))}
                </ul>
                <button
                    type="button"
                    onClick={() => addMilestone()}
                    className="w-full rounded-xl border border-dashed border-secondary-200 bg-white hover:bg-primary-50/50 hover:border-primary-300 py-3 text-sm font-semibold text-primary-600 transition-all"
                >
                    + {t("addMilestone")}
                </button>
            </div>
        </div>
    );
}

/* ───── Step 5: Review ───── */
function Step5() {
    const t = useTranslations("campaigns.wizard.step5");
    const locale = useLocale();
    const isAr = locale === "ar";
    const draft = useCampaignDraft((s) => s.draft);
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-bold text-secondary-900 mb-1">{t("title")}</h2>
                <p className="text-sm text-secondary-500">{t("description")}</p>
            </div>
            <div className="space-y-4">
                <ReviewCard
                    title={isAr ? "العنوان والوصف" : "Title & Pitch"}
                    items={[
                        { label: isAr ? "العنوان" : "Title", value: draft.title },
                        { label: isAr ? "الوصف المختصر" : "Pitch", value: draft.pitch },
                        { label: isAr ? "المشكلة" : "Problem", value: draft.problem.length > 200 ? draft.problem.slice(0, 200) + "…" : draft.problem },
                        ...(draft.outcome ? [{ label: isAr ? "النتيجة المتوقعة" : "Outcome", value: draft.outcome }] : []),
                    ]}
                />
                <ReviewCard
                    title={isAr ? "الفئة" : "Category"}
                    items={[
                        { label: isAr ? "الفئة" : "Category", value: draft.category ? (isAr ? CATEGORY_I18N[draft.category]?.ar : CATEGORY_I18N[draft.category]?.en) ?? draft.category : (isAr ? "بدون فئة" : "No category") },
                        { label: isAr ? "اللغة" : "Language", value: draft.language },
                        ...(draft.country ? [{ label: isAr ? "البلد" : "Country", value: draft.country }] : []),
                        ...(draft.contactEmail ? [{ label: isAr ? "البريد" : "Email", value: draft.contactEmail }] : []),
                    ]}
                />
                <ReviewCard
                    title={isAr ? "الأدوار" : "Roles"}
                    items={draft.roles.length > 0
                        ? draft.roles.map((r, i) => ({
                              label: `${isAr ? "دور" : "Role"} ${i + 1}`,
                              value: `${r.title} — ${r.skillName} ×${r.count}`,
                          }))
                        : [{ label: "", value: isAr ? "لم تُضف أدوار بعد" : "No roles added yet" }]
                    }
                />
                <ReviewCard
                    title={isAr ? "الجدول والمحطات" : "Timeline & Milestones"}
                    items={[
                        ...(draft.startsAt ? [{ label: isAr ? "تاريخ البدء" : "Starts", value: draft.startsAt }] : []),
                        ...(draft.recruitmentDeadline ? [{ label: isAr ? "الموعد النهائي" : "Deadline", value: draft.recruitmentDeadline }] : []),
                        { label: isAr ? "عدد المحطات" : "Milestones", value: String(draft.milestones.length) },
                    ]}
                />
            </div>
        </div>
    );
}

/* ───── Reusable pieces ───── */

function Field({
    label,
    hint,
    icon,
    children,
}: {
    label: string;
    hint?: string;
    icon?: React.ReactNode;
    children: React.ReactNode;
}) {
    return (
        <div>
            <label className="flex items-center gap-1.5 text-sm font-semibold text-secondary-700 mb-1.5">
                {icon && <span className="text-secondary-400">{icon}</span>}
                {label}
                {hint && <span className="text-xs text-secondary-400 font-normal ml-1">({hint})</span>}
            </label>
            {children}
        </div>
    );
}

function ReviewCard({ title, items }: { title: string; items: Array<{ label: string; value: string }> }) {
    return (
        <div className="rounded-xl border border-secondary-200 bg-secondary-50/30 overflow-hidden">
            <div className="px-4 py-2.5 bg-secondary-50 border-b border-secondary-200">
                <h3 className="text-xs font-bold uppercase tracking-wider text-secondary-500">{title}</h3>
            </div>
            <div className="p-4 space-y-2.5">
                {items.map((item, i) => (
                    <div key={i} className="flex gap-3">
                        {item.label && (
                            <span className="text-xs font-semibold text-secondary-500 w-28 shrink-0 pt-0.5">
                                {item.label}
                            </span>
                        )}
                        <span className="text-sm text-secondary-800 flex-1 break-words">
                            {item.value || "—"}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
