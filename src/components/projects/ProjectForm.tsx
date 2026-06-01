"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
    Upload, X, Loader2, Link as LinkIcon, Github,
    Clock, Calendar, Sparkles, AlertTriangle, Save, Send
} from "lucide-react";

interface ProjectFormProps {
    locale: string;
    mode: "create" | "edit";
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
    const router = useRouter();

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
    const [imageUploading, setImageUploading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
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
        if (!slugEdited && mode === "create") {
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
                const res = await fetch(`/api/skills?search=${encodeURIComponent(skillSearch)}`);
                if (res.ok) {
                    const data = await res.json();
                    setSkillResults(data.filter((s: { id: number }) => !selectedSkills.some(ss => ss.skillId === s.id)));
                }
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
                const data = await res.json();
                throw new Error(data.error);
            }
            const { url } = await res.json();
            setFeaturedImage(url);
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to upload image";
            setError(message);
        } finally {
            setImageUploading(false);
        }
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith("image/")) {
            handleImageUpload(file);
        }
    }, [handleImageUpload]);

    const handleSubmit = async (submitForReview: boolean) => {
        setError("");
        setSuccess("");

        if (!title.trim() || !description.trim() || !category) {
            setError(t("requiredField"));
            return;
        }

        setSaving(true);
        try {
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
            };

            let res: Response;
            if (mode === "create") {
                res = await fetch("/api/projects", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });
            } else {
                res = await fetch(`/api/projects/${initialData!.id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });
            }

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to save project");
            }

            const project = await res.json();

            // If submit for review, change status
            if (submitForReview && (mode === "create" || initialData?.status === "DRAFT")) {
                await fetch(`/api/projects/${project.id}/status`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ status: "PENDING" }),
                });
            }

            setSuccess(mode === "create" ? t("projectCreated") : t("projectUpdated"));
            setTimeout(() => router.push(`/${locale}/projects/${project.slug}`), 1200);
        } catch (err) {
            const message = err instanceof Error ? err.message : "An error occurred";
            setError(message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-waqf-bg">
            <div className="max-w-[900px] mx-auto px-6 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-secondary-900">
                        {mode === "create" ? t("createProject") : t("editProject")}
                    </h1>
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
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                            <div>
                                <label className="block text-sm font-semibold text-secondary-900 mb-2 flex items-center gap-1.5">
                                    <Github className="w-4 h-4 text-secondary-400" />
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
                        </div>
                    </div>

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
                                placeholder={locale === "ar" ? "ابحث عن مهارة..." : "Search for a skill..."}
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
                    <div className="flex flex-wrap gap-3 justify-end pt-2">
                        <button
                            onClick={() => handleSubmit(false)}
                            disabled={saving}
                            className="flex items-center gap-2 px-6 py-3 bg-white border border-secondary-200 text-secondary-700 font-medium rounded-xl hover:bg-secondary-50 transition-colors disabled:opacity-50"
                        >
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            {mode === "create" ? t("saveDraft") : t("saveChanges")}
                        </button>
                        {(mode === "create" || initialData?.status === "DRAFT") && (
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
