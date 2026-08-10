"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
    Upload, X, Loader2, Link as LinkIcon,
    Clock, Calendar, Sparkles, AlertTriangle, Save, Send, ArrowLeft, Globe, Mail, User, FileText
} from "lucide-react";
import { SiGithub } from "@icons-pack/react-simple-icons";
import Link from "next/link";
import { apiFetch, ApiError, type ApiErrorDetail } from "@/lib/api/client";
import { translateApiError } from "@/lib/i18n/client-errors";

interface ProjectFormProps {
    locale: string;
    mode: "create" | "edit" | "curate";
    initialData?: {
        id: string;
        title: string;
        slug: string;
        description: string;
        category: string;
        language: string;
        impact: string | null;
        timeCommitment: string | null;
        duration: string | null;
        githubUrl: string | null;
        featuredImage: string | null;
        organizationId: string | null;
        status: string;
        adminFeedback: string | null;
        externalUrl?: string | null;
        externalOwnerName?: string | null;
        externalOwnerContact?: string | null;
        curatorNotes?: string | null;
        skills: Array<{ skillId: number; skill: { id: number; name: string; nameAr: string | null }; isRequired: boolean }>;
    };
    organizations?: Array<{ id: string; name: string }>;
}

const CATEGORIES = ["QURAN", "PRAYER", "CHARITY", "EDUCATION", "COMMUNITY", "TOOLS"];
const LANGUAGES = ["ARABIC", "ENGLISH", "BOTH"];

function slugify(text: string) {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
}

export function ProjectForm({ locale, mode, initialData, organizations }: ProjectFormProps) {
    const t = useTranslations("projects");
    const tGlobal = useTranslations();
    const router = useRouter();
    const isCurate = mode === "curate";

    const [title, setTitle] = useState(initialData?.title || "");
    const [slug, setSlug] = useState(initialData?.slug || "");
    const [slugEdited, setSlugEdited] = useState(false);
    const [description, setDescription] = useState(initialData?.description || "");
    const [category, setCategory] = useState(initialData?.category || "");
    const [language, setLanguage] = useState(initialData?.language || "BOTH");
    const [impact, setImpact] = useState(initialData?.impact || "");
    const [timeCommitment, setTimeCommitment] = useState(initialData?.timeCommitment || "");
    const [duration, setDuration] = useState(initialData?.duration || "");
    const [githubUrl, setGithubUrl] = useState(initialData?.githubUrl || "");
    const [featuredImage, setFeaturedImage] = useState(initialData?.featuredImage || "");
    const [organizationId, setOrganizationId] = useState(initialData?.organizationId || "");
    const [externalUrl, setExternalUrl] = useState(initialData?.externalUrl || "");
    const [externalOwnerName, setExternalOwnerName] = useState(initialData?.externalOwnerName || "");
    const [externalOwnerContact, setExternalOwnerContact] = useState(initialData?.externalOwnerContact || "");
    const [curatorNotes, setCuratorNotes] = useState(initialData?.curatorNotes || "");
    const [imageUploading, setImageUploading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [saveAsDraft, setSaveAsDraft] = useState(initialData?.status === "DRAFT");
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Skills state
    const [selectedSkills, setSelectedSkills] = useState<Array<{ skillId: number; name: string; isRequired: boolean }>>(
        initialData?.skills?.map(s => ({ skillId: s.skill.id, name: s.skill.name, isRequired: s.isRequired })) || []
    );
    const [skillSearch, setSkillSearch] = useState("");
    const [skillResults, setSkillResults] = useState<Array<{ id: number; name: string; nameAr: string | null }>>([]);
    const [showSkillDropdown, setShowSkillDropdown] = useState(false);

    // Auto-generate slug from title
    useEffect(() => {
        if (!slugEdited && (mode === "create" || mode === "curate")) {
            setSlug(slugify(title));
        }
    }, [title, slugEdited, mode]);

    // Search skills
    useEffect(() => {
        if (skillSearch.length < 2) {
            setSkillResults([]);
            return;
        }
        const timer = setTimeout(async () => {
            try {
                const data = await apiFetch<Array<{ id: number; name: string; nameAr: string | null }>>(
                    `/api/skills`,
                    { query: { search: skillSearch } }
                );
                setSkillResults(data.filter((s) => !selectedSkills.some(ss => ss.skillId === s.id)));
            } catch { /* ignore */ }
        }, 300);
        return () => clearTimeout(timer);
    }, [skillSearch, selectedSkills]);

    const handleImageUpload = useCallback(async (file: File) => {
        setImageUploading(true);
        try {
            const formData = new FormData();
            formData.append("file", file);
            const res = await fetch("/api/upload", { method: "POST", body: formData });
            if (!res.ok) {
                const data = await res.json().catch(() => null);
                throw new ApiError({
                    status: res.status,
                    code: (data as { code?: string } | null)?.code ?? "INTERNAL",
                    message: (data as { error?: string } | null)?.error ?? `Request failed with status ${res.status}`,
                    details: (data as { details?: ApiErrorDetail[] } | null)?.details,
                });
            }
            const { url } = await res.json();
            setFeaturedImage(url);
        } catch (err) {
            setError(translateApiError(tGlobal, err));
        } finally {
            setImageUploading(false);
        }
    }, [tGlobal]);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith("image/")) {
            handleImageUpload(file);
        }
    }, [handleImageUpload]);

    const handleSubmit = async (submitForReview = false) => {
        setError("");
        setSuccess("");

        if (!title.trim() || !description.trim() || !category) {
            setError(t("requiredField"));
            return;
        }

        if (isCurate) {
            if (!externalUrl.trim() || !externalOwnerName.trim() || !externalOwnerContact.trim()) {
                setError(t("requiredField"));
                return;
            }
        }

        setSaving(true);
        try {
            if (isCurate) {
                const payload = {
                    title: title.trim(),
                    description: description.trim(),
                    category,
                    language,
                    impact: impact.trim() || null,
                    timeCommitment: timeCommitment.trim() || null,
                    duration: duration.trim() || null,
                    featuredImage: featuredImage || null,
                    externalUrl: externalUrl.trim(),
                    externalOwnerName: externalOwnerName.trim(),
                    externalOwnerContact: externalOwnerContact.trim(),
                    curatorNotes: curatorNotes.trim() || null,
                    skills: selectedSkills.map(s => ({ skillId: s.skillId, isRequired: s.isRequired })),
                    ...(!initialData
                        ? { customSlug: slug || undefined }
                        : {}),
                    ...(!initialData || saveAsDraft !== (initialData.status === "DRAFT")
                        ? { status: saveAsDraft ? "DRAFT" : "OPEN" }
                        : {}),
                };

                const res = initialData
                    ? await apiFetch<{ slug?: string }>(`/api/admin/curated-projects/${initialData.id}`, {
                        method: "PATCH",
                        body: payload,
                    })
                    : await apiFetch<{ slug?: string }>("/api/admin/curated-projects", {
                        method: "POST",
                        body: payload,
                    });

                setSuccess(initialData ? t("projectUpdated") : t("projectCreated"));
                setTimeout(() => router.push(`/${locale}/admin/projects/curated`), 1200);
                return;
            }

            const payload = {
                title: title.trim(),
                description: description.trim(),
                category,
                language,
                impact: impact.trim() || null,
                timeCommitment: timeCommitment.trim() || null,
                duration: duration.trim() || null,
                githubUrl: githubUrl.trim() || null,
                featuredImage: featuredImage || null,
                organizationId: organizationId || null,
                skills: selectedSkills.map(s => ({ skillId: s.skillId, isRequired: s.isRequired })),
                ...(mode === "create" ? { customSlug: slug || undefined } : { slug: slug || undefined }),
                ...(submitForReview ? { status: "PENDING" } : {}),
            };

            let project: { slug: string };
            if (mode === "create") {
                project = await apiFetch<{ slug: string }>("/api/projects", {
                    method: "POST",
                    body: payload,
                });
            } else {
                project = await apiFetch<{ slug: string }>(`/api/projects/${initialData!.id}`, {
                    method: "PUT",
                    body: payload,
                });
            }

            setSuccess(mode === "create" ? t("projectCreated") : t("projectUpdated"));
            setTimeout(() => router.push(`/${locale}/projects/${project.slug}`), 1200);
        } catch (err) {
            setError(translateApiError(tGlobal, err));
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-waqf-bg">
            <div className="max-w-[900px] mx-auto px-6 py-8">
                {/* Back Link */}
                <Link
                    href={
                        isCurate
                            ? `/${locale}/admin/projects/curated`
                            : mode === "edit" && initialData?.slug
                                ? `/${locale}/projects/${initialData.slug}`
                                : `/${locale}/explore`
                    }
                    className="inline-flex items-center gap-1.5 text-sm text-secondary-500 hover:text-primary-600 transition-colors mb-4"
                >
                    <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
                    {t("back")}
                </Link>

                {/* Header */}
                <div className="mb-8">
                    {isCurate && (
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold mb-2">
                            <Globe className="w-3.5 h-3.5" />
                            {locale === "ar" ? "مشروع منتقى خارجي" : "External Curated Project"}
                        </div>
                    )}
                    <h1 className="text-3xl font-bold text-secondary-900">
                        {mode === "create"
                            ? t("createProject")
                            : isCurate
                                ? (locale === "ar" ? "تعديل مشروع منتقى" : "Edit Curated Project")
                                : t("editProject")}
                    </h1>
                    {isCurate && (
                        <p className="text-secondary-500 mt-2 text-sm">
                            {locale === "ar"
                                ? "سيظهر هذا المشروع للزوار مع رابط للموقع الأصلي، ولن يكون متاحًا للتقديم من خلال المنصة."
                                : "This project will be shown to visitors with a link to the original site. It will not be open to applications through the platform."}
                        </p>
                    )}
                </div>

                {/* Admin Feedback Banner */}
                {initialData?.adminFeedback && (
                    <div className="mb-6 p-5 rounded-2xl bg-amber-50 border border-amber-200">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                            <div>
                                <h3 className="font-bold text-amber-800 mb-1">{t("adminFeedback")}</h3>
                                <p className="text-sm text-amber-700">{t("adminFeedbackDescription")}</p>
                                <p className="mt-2 text-amber-900 bg-amber-100 rounded-xl p-3 text-sm">{initialData.adminFeedback}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Messages */}
                {error && (
                    <div className="mb-6 p-4 rounded-xl bg-red-50 text-red-700 border border-red-200 text-sm">{error}</div>
                )}
                {success && (
                    <div className="mb-6 p-4 rounded-xl bg-green-50 text-green-700 border border-green-200 text-sm">{success}</div>
                )}

                <div className="space-y-6">
                    {/* Title + Slug */}
                    <div className="bg-white rounded-2xl border border-waqf-border p-6">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-secondary-900 mb-2">{t("projectTitle")} *</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                    placeholder={t("projectTitlePlaceholder")}
                                    className="w-full px-4 py-3 rounded-xl border border-secondary-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-lg"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-secondary-900 mb-1">{t("slug")}</label>
                                <p className="text-xs text-secondary-500 mb-2">{t("slugHint")}</p>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-secondary-400">/projects/</span>
                                    <input
                                        type="text"
                                        value={slug}
                                        onChange={e => { setSlug(slugify(e.target.value)); setSlugEdited(true); }}
                                        className="flex-1 px-3 py-2 rounded-lg border border-secondary-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm font-mono"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="bg-white rounded-2xl border border-waqf-border p-6">
                        <label className="block text-sm font-semibold text-secondary-900 mb-2">{t("description")} *</label>
                        <textarea
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            placeholder={t("descriptionPlaceholder")}
                            rows={6}
                            className="w-full px-4 py-3 rounded-xl border border-secondary-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-y"
                        />
                    </div>

                    {/* Category + Language + Organization */}
                    <div className="bg-white rounded-2xl border border-waqf-border p-6">
                        <div className={`grid grid-cols-1 ${isCurate ? "md:grid-cols-2" : "md:grid-cols-3"} gap-4`}>
                            <div>
                                <label className="block text-sm font-semibold text-secondary-900 mb-2">{t("category")} *</label>
                                <select
                                    value={category}
                                    onChange={e => setCategory(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-secondary-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                >
                                    <option value="">{t("selectCategory")}</option>
                                    {CATEGORIES.map(c => (
                                        <option key={c} value={c}>{c.charAt(0) + c.slice(1).toLowerCase()}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-secondary-900 mb-2">{t("language")}</label>
                                <select
                                    value={language}
                                    onChange={e => setLanguage(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-secondary-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                >
                                    {LANGUAGES.map(l => (
                                        <option key={l} value={l}>{l.charAt(0) + l.slice(1).toLowerCase()}</option>
                                    ))}
                                </select>
                            </div>
                            {!isCurate && (
                                <div>
                                    <label className="block text-sm font-semibold text-secondary-900 mb-2">{t("organization")}</label>
                                    <select
                                        value={organizationId}
                                        onChange={e => setOrganizationId(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-secondary-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                    >
                                        <option value="">{t("noOrganization")}</option>
                                        {organizations?.map(org => (
                                            <option key={org.id} value={org.id}>{org.name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Impact */}
                    <div className="bg-white rounded-2xl border border-waqf-border p-6">
                        <label className="block text-sm font-semibold text-secondary-900 mb-2 flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-primary-600" />
                            {t("impact")}
                        </label>
                        <textarea
                            value={impact}
                            onChange={e => setImpact(e.target.value)}
                            placeholder={t("impactPlaceholder")}
                            rows={3}
                            className="w-full px-4 py-3 rounded-xl border border-secondary-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-y"
                        />
                    </div>

                    {/* Time + Duration + GitHub */}
                    <div className="bg-white rounded-2xl border border-waqf-border p-6">
                        <div className={`grid grid-cols-1 ${isCurate ? "md:grid-cols-2" : "md:grid-cols-3"} gap-4`}>
                            <div>
                                <label className="block text-sm font-semibold text-secondary-900 mb-2 flex items-center gap-1.5">
                                    <Clock className="w-4 h-4 text-secondary-400" />
                                    {t("timeCommitment")}
                                </label>
                                <input
                                    type="text"
                                    value={timeCommitment}
                                    onChange={e => setTimeCommitment(e.target.value)}
                                    placeholder={t("timeCommitmentPlaceholder")}
                                    className="w-full px-4 py-3 rounded-xl border border-secondary-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-secondary-900 mb-2 flex items-center gap-1.5">
                                    <Calendar className="w-4 h-4 text-secondary-400" />
                                    {t("duration")}
                                </label>
                                <input
                                    type="text"
                                    value={duration}
                                    onChange={e => setDuration(e.target.value)}
                                    placeholder={t("durationPlaceholder")}
                                    className="w-full px-4 py-3 rounded-xl border border-secondary-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                />
                            </div>
                            {!isCurate && (
                                <div>
                                    <label className="block text-sm font-semibold text-secondary-900 mb-2 flex items-center gap-1.5">
                                        <SiGithub className="w-4 h-4 text-secondary-400" />
                                        {t("githubUrl")}
                                    </label>
                                    <input
                                        type="url"
                                        value={githubUrl}
                                        onChange={e => setGithubUrl(e.target.value)}
                                        placeholder={t("githubUrlPlaceholder")}
                                        className="w-full px-4 py-3 rounded-xl border border-secondary-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* External Project Details (curate mode only) */}
                    {isCurate && (
                        <div className="bg-purple-50/50 rounded-2xl border border-purple-200 p-6 space-y-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Globe className="w-5 h-5 text-purple-700" />
                                <h2 className="text-lg font-bold text-purple-900">
                                    {locale === "ar" ? "تفاصيل المشروع الخارجي" : "External Project Details"}
                                </h2>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-secondary-900 mb-2 flex items-center gap-1.5">
                                    <LinkIcon className="w-4 h-4 text-purple-600" />
                                    {locale === "ar" ? "رابط المشروع الأصلي" : "Original Project URL"} *
                                </label>
                                <input
                                    type="url"
                                    value={externalUrl}
                                    onChange={e => setExternalUrl(e.target.value)}
                                    placeholder="https://example.com"
                                    className="w-full px-4 py-3 rounded-xl border border-secondary-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                />
                                <p className="text-xs text-secondary-500 mt-1">
                                    {locale === "ar"
                                        ? "الرابط الذي سيُرسل إليه الزوار عند الضغط على زر \"زيارة المشروع\""
                                        : "Visitors will be directed to this URL when they click \"Visit project\""}
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-secondary-900 mb-2 flex items-center gap-1.5">
                                        <User className="w-4 h-4 text-purple-600" />
                                        {locale === "ar" ? "اسم المالك الأصلي" : "Original Owner Name"} *
                                    </label>
                                    <input
                                        type="text"
                                        value={externalOwnerName}
                                        onChange={e => setExternalOwnerName(e.target.value)}
                                        placeholder={locale === "ar" ? "مثال: فريق حرم بلر" : "e.g. Haramblur Team"}
                                        className="w-full px-4 py-3 rounded-xl border border-secondary-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-secondary-900 mb-2 flex items-center gap-1.5">
                                        <Mail className="w-4 h-4 text-purple-600" />
                                        {locale === "ar" ? "تواصل المالك" : "Owner Contact"} *
                                    </label>
                                    <input
                                        type="text"
                                        value={externalOwnerContact}
                                        onChange={e => setExternalOwnerContact(e.target.value)}
                                        placeholder={locale === "ar" ? "بريد، رابط، أو @handle" : "email, URL, or @handle"}
                                        className="w-full px-4 py-3 rounded-xl border border-secondary-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-secondary-900 mb-2 flex items-center gap-1.5">
                                    <FileText className="w-4 h-4 text-purple-600" />
                                    {locale === "ar" ? "ملاحظات المنتقى (داخلية)" : "Curator Notes (internal)"}
                                </label>
                                <textarea
                                    value={curatorNotes}
                                    onChange={e => setCuratorNotes(e.target.value)}
                                    placeholder={locale === "ar" ? "ملاحظات للإدارة فقط — لن تُعرض للزوار" : "Notes for admin reference only — not shown to visitors"}
                                    rows={4}
                                    className="w-full px-4 py-3 rounded-xl border border-secondary-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-y"
                                />
                            </div>
                        </div>
                    )}

                    {/* Featured Image Upload */}
                    <div className="bg-white rounded-2xl border border-waqf-border p-6">
                        <label className="block text-sm font-semibold text-secondary-900 mb-2">{t("featuredImage")}</label>
                        <p className="text-xs text-secondary-500 mb-3">{t("featuredImageHint")}</p>

                        {featuredImage ? (
                            <div className="relative rounded-xl overflow-hidden border border-secondary-200">
                                <img src={featuredImage} alt="Featured" className="w-full h-48 object-cover" />
                                <button
                                    onClick={() => setFeaturedImage("")}
                                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <div
                                onDragOver={e => e.preventDefault()}
                                onDrop={handleDrop}
                                onClick={() => fileInputRef.current?.click()}
                                className="border-2 border-dashed border-secondary-300 rounded-xl py-12 text-center cursor-pointer hover:border-primary-400 hover:bg-primary-50/30 transition-all"
                            >
                                {imageUploading ? (
                                    <Loader2 className="w-8 h-8 text-primary-600 animate-spin mx-auto" />
                                ) : (
                                    <Upload className="w-8 h-8 text-secondary-400 mx-auto mb-2" />
                                )}
                                <p className="text-sm text-secondary-500">{t("featuredImageHint")}</p>
                            </div>
                        )}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/gif"
                            className="hidden"
                            onChange={e => {
                                const file = e.target.files?.[0];
                                if (file) handleImageUpload(file);
                            }}
                        />
                    </div>

                    {/* Skills */}
                    <div className="bg-white rounded-2xl border border-waqf-border p-6">
                        <label className="block text-sm font-semibold text-secondary-900 mb-3">{t("skills")}</label>

                        {selectedSkills.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-4">
                                {selectedSkills.map(s => (
                                    <span
                                        key={s.skillId}
                                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium ${s.isRequired
                                            ? "bg-primary-50 text-primary-700 border border-primary-200"
                                            : "bg-secondary-50 text-secondary-600 border border-secondary-200"
                                            }`}
                                    >
                                        {s.name}
                                        <button
                                            onClick={() => setSelectedSkills(prev => prev.filter(ss => ss.skillId !== s.skillId))}
                                            className="hover:text-red-500"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}

                        <div className="relative">
                            <input
                                type="text"
                                value={skillSearch}
                                onChange={e => { setSkillSearch(e.target.value); setShowSkillDropdown(true); }}
                                onFocus={() => setShowSkillDropdown(true)}
                                placeholder={t("skillSearchPlaceholder")}
                                className="w-full px-4 py-3 rounded-xl border border-secondary-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            />
                            {showSkillDropdown && skillResults.length > 0 && (
                                <div className="absolute z-20 top-full mt-1 w-full bg-white rounded-xl border border-secondary-200 shadow-lg max-h-48 overflow-y-auto">
                                    {skillResults.map(skill => (
                                        <button
                                            key={skill.id}
                                            onClick={() => {
                                                setSelectedSkills(prev => [...prev, { skillId: skill.id, name: skill.name, isRequired: true }]);
                                                setSkillSearch("");
                                                setShowSkillDropdown(false);
                                            }}
                                            className="w-full text-left px-4 py-2.5 hover:bg-secondary-50 text-sm"
                                        >
                                            {locale === "ar" ? skill.nameAr || skill.name : skill.name}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
                        {isCurate && (
                            <label className="flex items-center gap-2 text-sm text-secondary-600 cursor-pointer me-auto">
                                <input
                                    type="checkbox"
                                    checked={saveAsDraft}
                                    onChange={(e) => setSaveAsDraft(e.target.checked)}
                                    className="w-4 h-4 rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                                />
                                {locale === "ar" ? "حفظ كمسودة (إخفاء عن الزوار)" : "Save as draft (hidden from visitors)"}
                            </label>
                        )}
                        <button
                            onClick={() => handleSubmit()}
                            disabled={saving}
                            className="flex items-center gap-2 px-6 py-3 bg-white border border-secondary-200 text-secondary-700 font-medium rounded-xl hover:bg-secondary-50 transition-colors disabled:opacity-50"
                        >
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            {isCurate
                                ? (initialData
                                    ? (locale === "ar" ? "حفظ التغييرات" : "Save Changes")
                                    : (saveAsDraft
                                        ? (locale === "ar" ? "حفظ كمسودة" : "Save as Draft")
                                        : (locale === "ar" ? "نشر" : "Publish")))
                                : (mode === "create" ? t("saveDraft") : t("saveChanges"))}
                        </button>
                        {!isCurate && (mode === "create" || initialData?.status === "DRAFT") && (
                            <button
                                onClick={() => handleSubmit(true)}
                                disabled={saving}
                                className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 transition-colors shadow-md shadow-primary-600/20 disabled:opacity-50"
                            >
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                {t("submitReview")}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
