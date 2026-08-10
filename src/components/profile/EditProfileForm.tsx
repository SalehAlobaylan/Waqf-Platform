"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Save, Loader2, MessageSquare, Phone } from "lucide-react";
import { SkillSelector } from "./SkillSelector";
import { PortfolioManager } from "./PortfolioManager";
import type { ContributorProfile, ContributorSkill, PortfolioItem } from "@prisma/client";
import { apiFetch } from "@/lib/api/client";
import { translateApiError } from "@/lib/i18n/client-errors";

interface EditProfileFormProps {
    initialProfile: ContributorProfile;
    initialSkills: ContributorSkill[];
    initialPortfolio: PortfolioItem[];
    locale: string;
    userHandle: string;
}

export function EditProfileForm({ initialProfile, initialSkills, initialPortfolio, locale, userHandle }: EditProfileFormProps) {
    const router = useRouter();
    const t = useTranslations("profile.edit");
    const tGlobal = useTranslations();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const [form, setForm] = useState({
        bio: initialProfile.bio || "",
        intentionStatement: initialProfile.intentionStatement || "",
        discord: initialProfile.discord || "",
        whatsapp: initialProfile.whatsapp || "",
        isAvailable: initialProfile.isAvailable,
        hoursPerWeek: initialProfile.hoursPerWeek ?? null,
    });

    const [selectedSkills, setSelectedSkills] = useState<number[]>(
        initialSkills.map(sk => sk.skillId)
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccess(false);

        try {
            await apiFetch("/api/contributors/profile", {
                method: "PATCH",
                body: {
                    ...form,
                    selectedSkills,
                    hoursPerWeek: form.hoursPerWeek ?? null,
                },
            });

            setSuccess(true);
            router.refresh();
        } catch (err) {
            setError(translateApiError(tGlobal, err));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="p-6 border-b border-secondary-100 bg-secondary-50/50">
                <h2 className="text-xl font-bold text-secondary-900">
                    {t("title")}
                </h2>
                <p className="text-sm text-secondary-500 mt-1">
                    {locale === "ar"
                        ? "قم بتحديث معلوماتك وخبراتك لتسهيل اختيارك للمشاريع المناسبة."
                        : "Update your information and skills to help projects find you."}
                </p>
            </div>

            <div className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="p-4 rounded-xl bg-red-50 text-red-700 text-sm border border-red-200">
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="p-4 rounded-xl bg-green-50 text-green-700 text-sm border border-green-200">
                            {t("saveSuccess")}
                        </div>
                    )}

                    {/* Basic Info */}
                    <div className="space-y-4">
                        <h3 className="font-medium text-secondary-900">{locale === "ar" ? "نبذة عنك" : "About You"}</h3>
                        <div>
                            <label className="block text-sm font-medium text-secondary-700 mb-1">
                                {t("bio")}
                            </label>
                            <textarea
                                value={form.bio}
                                onChange={e => setForm({ ...form, bio: e.target.value })}
                                rows={4}
                                className="w-full px-4 py-2 rounded-xl border border-secondary-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-secondary-50 focus:bg-white transition-all"
                                placeholder={t("bioPlaceholder")}
                            />
                        </div>
                    </div>

                    {/* Availability */}
                    <div className="space-y-4 pt-4 border-t border-secondary-100">
                        <h3 className="font-medium text-secondary-900">{locale === "ar" ? "التوفر" : "Availability"}</h3>
                        <div className="flex items-center justify-between p-4 rounded-xl border border-secondary-200 bg-secondary-50/50">
                            <div>
                                <p className="text-sm font-medium text-secondary-800">
                                    {locale === "ar" ? "متاح للمساهمة" : "Open to contributing"}
                                </p>
                                <p className="text-xs text-secondary-500 mt-0.5">
                                    {locale === "ar"
                                        ? "إظهار حالتك كمتاح يجعل أصحاب المشاريع يجدونك بسهولة."
                                        : "Marking yourself available helps project owners find you."}
                                </p>
                            </div>
                            <button
                                type="button"
                                role="switch"
                                aria-checked={form.isAvailable}
                                onClick={() => setForm({ ...form, isAvailable: !form.isAvailable })}
                                className={`relative w-12 h-7 rounded-full transition-colors shrink-0 ${form.isAvailable ? "bg-primary-600" : "bg-secondary-300"}`}
                            >
                                <span className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-all ${form.isAvailable ? "left-6" : "left-1"}`} />
                            </button>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-secondary-700 mb-1">
                                {locale === "ar" ? "ساعات التفرغ أسبوعياً (اختياري)" : "Hours per week (optional)"}
                            </label>
                            <input
                                type="number"
                                min={1}
                                max={168}
                                value={form.hoursPerWeek ?? ""}
                                onChange={e => setForm({ ...form, hoursPerWeek: e.target.value ? Number(e.target.value) : null })}
                                className="w-full px-4 py-2 rounded-xl border border-secondary-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-secondary-50 focus:bg-white"
                                placeholder={locale === "ar" ? "مثال: 10" : "e.g. 10"}
                            />
                        </div>
                    </div>

                    {/* Social/External Contacts */}
                    <div className="space-y-4 pt-4 border-t border-secondary-100">
                        <h3 className="font-medium text-secondary-900">{locale === "ar" ? "معلومات التواصل" : "Contact Information"}</h3>
                        <p className="text-xs text-secondary-500 mb-2">
                            {locale === "ar" ? "ستظهر هذه الروابط في ملفك الشخصي لتسهيل تواصل أصحاب المشاريع معك." : "These will appear on your profile to help project owners contact you."}
                        </p>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-secondary-700 mb-1 flex items-center gap-2">
                                    <MessageSquare size={16} className="text-[#5865F2]" />
                                    {t("discord")}
                                </label>
                                <input
                                    type="text"
                                    value={form.discord}
                                    onChange={e => setForm({ ...form, discord: e.target.value })}
                                    className="w-full px-4 py-2 rounded-xl border border-secondary-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-secondary-50 focus:bg-white"
                                    placeholder={t("discordPlaceholder")}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-secondary-700 mb-1 flex items-center gap-2">
                                    <Phone size={16} className="text-[#25D366]" />
                                    {t("whatsapp")}
                                </label>
                                <input
                                    type="text"
                                    value={form.whatsapp}
                                    onChange={e => setForm({ ...form, whatsapp: e.target.value })}
                                    className="w-full px-4 py-2 rounded-xl border border-secondary-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-secondary-50 focus:bg-white"
                                    placeholder={t("whatsappPlaceholder")}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Skills */}
                    <div className="space-y-4 pt-4 border-t border-secondary-100">
                        <h3 className="font-medium text-secondary-900">{locale === "ar" ? "المهارات التقنية" : "Technical Skills"}</h3>
                        <SkillSelector
                            selectedSkills={selectedSkills}
                            onChange={setSelectedSkills}
                            locale={locale}
                        />
                    </div>

                    {/* Actions */}
                    <div className="pt-6 border-t border-secondary-100 flex justify-end gap-3">
                        <Link
                            href={`/${locale}/profile/${userHandle}`}
                            className="px-6 py-2.5 border border-secondary-200 text-secondary-700 font-medium rounded-xl hover:bg-secondary-50 transition"
                        >
                            {t("cancel")}
                        </Link>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center gap-2 px-6 py-2.5 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700 transition"
                        >
                            {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                            {t("saveChanges")}
                        </button>
                    </div>
                </form>

                {/* Portfolio Section lives below the main form since it saves automatically */}
                <div className="pt-10 mt-10 border-t border-secondary-200">
                    <PortfolioManager
                        initialItems={initialPortfolio}
                        locale={locale}
                        contributorId={initialProfile.id}
                    />
                </div>
            </div>
        </div>
    );
}
