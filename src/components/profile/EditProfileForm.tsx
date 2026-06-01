"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, Loader2, MessageSquare, Phone } from "lucide-react";
import { SkillSelector } from "./SkillSelector";
import { PortfolioManager } from "./PortfolioManager";
import type { ContributorProfile, ContributorSkill, PortfolioItem } from "@prisma/client";

interface EditProfileFormProps {
    initialProfile: ContributorProfile;
    initialSkills: ContributorSkill[];
    initialPortfolio: PortfolioItem[];
    locale: string;
}

export function EditProfileForm({ initialProfile, initialSkills, initialPortfolio, locale }: EditProfileFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const [form, setForm] = useState({
        bio: initialProfile.bio || "",
        intentionStatement: initialProfile.intentionStatement || "",
        discord: initialProfile.discord || "",
        whatsapp: initialProfile.whatsapp || "",
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
            const res = await fetch("/api/contributors/profile", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...form, selectedSkills })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to update profile");
            }

            setSuccess(true);
            router.refresh();
        } catch (err) {
            const message = err instanceof Error ? err.message : "An unexpected error occurred";
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="p-6 border-b border-secondary-100 bg-secondary-50/50">
                <h2 className="text-xl font-bold text-secondary-900">
                    {locale === "ar" ? "تعديل الملف الشخصي" : "Edit Profile"}
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
                            {locale === "ar" ? "تم الحفظ بنجاح!" : "Saved successfully!"}
                        </div>
                    )}

                    {/* Basic Info */}
                    <div className="space-y-4">
                        <h3 className="font-medium text-secondary-900">{locale === "ar" ? "نبذة عنك" : "About You"}</h3>
                        <div>
                            <label className="block text-sm font-medium text-secondary-700 mb-1">
                                {locale === "ar" ? "السيرة الذاتية" : "Bio"}
                            </label>
                            <textarea
                                value={form.bio}
                                onChange={e => setForm({ ...form, bio: e.target.value })}
                                rows={4}
                                className="w-full px-4 py-2 rounded-xl border border-secondary-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-secondary-50 focus:bg-white transition-all"
                                placeholder={locale === "ar" ? "تحدث عن خبرتك ومجالك..." : "Describe your experience and background..."}
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
                                    Discord Username
                                </label>
                                <input
                                    type="text"
                                    value={form.discord}
                                    onChange={e => setForm({ ...form, discord: e.target.value })}
                                    className="w-full px-4 py-2 rounded-xl border border-secondary-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-secondary-50 focus:bg-white"
                                    placeholder="username#1234"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-secondary-700 mb-1 flex items-center gap-2">
                                    <Phone size={16} className="text-[#25D366]" />
                                    WhatsApp Formatted Link
                                </label>
                                <input
                                    type="text"
                                    value={form.whatsapp}
                                    onChange={e => setForm({ ...form, whatsapp: e.target.value })}
                                    className="w-full px-4 py-2 rounded-xl border border-secondary-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-secondary-50 focus:bg-white"
                                    placeholder="https://wa.me/1234567890"
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
                    <div className="pt-6 border-t border-secondary-100 flex justify-end">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center gap-2 px-6 py-2.5 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700 transition"
                        >
                            {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                            {locale === "ar" ? "حفظ التغييرات" : "Save Changes"}
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
