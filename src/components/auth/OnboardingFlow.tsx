"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Briefcase, Code, ArrowRight, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { apiFetch } from "@/lib/api/client";
import { translateApiError } from "@/lib/i18n/client-errors";

export function OnboardingFlow({ locale, userName }: { locale: string, userName: string }) {
    const t = useTranslations("onboarding");
    const tGlobal = useTranslations();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [selectedPath, setSelectedPath] = useState<"CONTRIBUTOR" | "CREATOR" | null>(null);
    const [orgName, setOrgName] = useState("");
    const [error, setError] = useState("");

    const handleComplete = async () => {
        if (!selectedPath) return;

        if (selectedPath === "CREATOR" && !orgName.trim()) {
            setError(t("orgNameRequired"));
            return;
        }

        setLoading(true);
        setError("");

        try {
            await apiFetch<{ success: boolean }>("/api/onboarding", {
                method: "POST",
                body: {
                    type: selectedPath,
                    orgName: selectedPath === "CREATOR" ? orgName : undefined,
                },
            });

            // Route to dashboard after completing onboarding
            router.push(`/${locale}/dashboard`);
            router.refresh();
        } catch (err) {
            setError(translateApiError(tGlobal, err));
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-waqf-border overflow-hidden">
            <div className="p-8 text-center border-b border-waqf-border bg-white">
                <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-lg bg-primary-600/10 text-primary-700 font-arabic font-bold text-3xl mb-6">
                    و
                </div>
                <h1 className="text-3xl font-bold text-secondary-900 mb-2">
                    {t("welcome", { name: userName })}
                </h1>
                <p className="text-secondary-600 max-w-lg mx-auto">
                    {t("description")}
                </p>
            </div>

            <div className="p-8">
                {error && (
                    <div className="mb-6 p-4 rounded-md bg-red-50 text-red-700 border border-red-200 text-sm">
                        {error}
                    </div>
                )}

                <div className="grid md:grid-cols-2 gap-6">
                    {/* Contributor Path */}
                    <button
                        onClick={() => setSelectedPath("CONTRIBUTOR")}
                        className={`text-left p-6 rounded-lg border-2 transition-all duration-200 ${selectedPath === "CONTRIBUTOR"
                            ? "border-primary-500 bg-primary-50/50"
                            : "border-waqf-border hover:border-primary-200 hover:bg-secondary-50"
                            }`}
                    >
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${selectedPath === "CONTRIBUTOR" ? "bg-primary-50 text-primary-600" : "bg-secondary-100 text-secondary-600"
                            }`}>
                            <Code size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-secondary-900 mb-2">
                            {t("contributor")}
                        </h3>
                        <p className="text-secondary-600 text-sm mb-4">
                            {t("contributorDescription")}
                        </p>
                        <ul className="text-sm text-secondary-500 space-y-2">
                            <li className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary-500"></div>
                                {t("createProfile")}
                            </li>
                            <li className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary-500"></div>
                                {t("findProjects")}
                            </li>
                            <li className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary-500"></div>
                                {t("buildHistory")}
                            </li>
                        </ul>
                    </button>

                    {/* Creator Path */}
                    <button
                        onClick={() => setSelectedPath("CREATOR")}
                        className={`text-left p-6 rounded-lg border-2 transition-all duration-200 ${selectedPath === "CREATOR"
                            ? "border-amber-500 bg-amber-50/50"
                            : "border-waqf-border hover:border-amber-200 hover:bg-secondary-50"
                            }`}
                    >
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${selectedPath === "CREATOR" ? "bg-accent-100 text-accent-700" : "bg-secondary-100 text-secondary-600"
                            }`}>
                            <Briefcase size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-secondary-900 mb-2">
                            {t("creator")}
                        </h3>
                        <p className="text-secondary-600 text-sm mb-4">
                            {t("creatorDescription")}
                        </p>
                        <ul className="text-sm text-secondary-500 space-y-2">
                            <li className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                                {t("registerOrg")}
                            </li>
                            <li className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                                {t("listProjects")}
                            </li>
                            <li className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                                {t("manageApplications")}
                            </li>
                        </ul>

                        {selectedPath === "CREATOR" && (
                            <div className="mt-6 p-4 rounded-md bg-white border border-waqf-border" onClick={(e) => e.stopPropagation()}>
                                <label htmlFor="orgName" className="block text-sm font-medium text-secondary-900 mb-2">
                                    {t("orgNameLabel")}
                                </label>
                                <input
                                    id="orgName"
                                    type="text"
                                    value={orgName}
                                    onChange={(e) => setOrgName(e.target.value)}
                                    placeholder={t("orgNamePlaceholder")}
                                    className="w-full px-4 py-2 rounded-lg border border-waqf-border focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                                />
                            </div>
                        )}
                    </button>
                </div>

                <div className="mt-8 flex justify-end">
                    <button
                        onClick={handleComplete}
                        disabled={!selectedPath || loading}
                        className={`flex items-center gap-2 px-8 py-3 rounded-md font-semibold text-white transition-all ${!selectedPath
                            ? "bg-secondary-300 cursor-not-allowed"
                            : selectedPath === "CONTRIBUTOR"
                                ? "bg-primary-600 hover:bg-primary-700"
                                : "bg-amber-600 hover:bg-amber-700"
                            }`}
                    >
                        {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                        {t("continue")}
                        {!loading && <ArrowRight className={`w-5 h-5 ${locale === "ar" ? "rotate-180" : ""}`} />}
                    </button>
                </div>
            </div>
        </div>
    );
}
