"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Briefcase, Code, ArrowRight, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";

export function OnboardingFlow({ locale, userId, userName }: { locale: string, userId: string, userName: string }) {
    const t = useTranslations("onboarding");
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
            const res = await fetch("/api/onboarding", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    type: selectedPath,
                    orgName: selectedPath === "CREATOR" ? orgName : undefined,
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || t("failedToComplete"));
            }

            // Route based on selection
            if (selectedPath === "CONTRIBUTOR") {
                router.push(`/${locale}/settings/profile`); // route to set up their skills
            } else {
                router.push(`/${locale}/projects/new`); // Creator should create project right away
            }
            router.refresh();
        } catch (err: any) {
            setError(err.message || t("unexpectedError"));
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-secondary-100 overflow-hidden">
            <div className="p-8 text-center border-b border-secondary-100 bg-gradient-to-br from-primary-50 to-white">
                <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 text-white font-bold text-3xl shadow-lg mb-6">
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
                    <div className="mb-6 p-4 rounded-xl bg-red-50 text-red-700 border border-red-200 text-sm">
                        {error}
                    </div>
                )}

                <div className="grid md:grid-cols-2 gap-6">
                    {/* Contributor Path */}
                    <button
                        onClick={() => setSelectedPath("CONTRIBUTOR")}
                        className={`text-left p-6 rounded-2xl border-2 transition-all duration-200 ${selectedPath === "CONTRIBUTOR"
                            ? "border-primary-500 bg-primary-50/50"
                            : "border-secondary-100 hover:border-primary-200 hover:bg-secondary-50"
                            }`}
                    >
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${selectedPath === "CONTRIBUTOR" ? "bg-primary-100 text-primary-600" : "bg-secondary-100 text-secondary-600"
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
                        className={`text-left p-6 rounded-2xl border-2 transition-all duration-200 ${selectedPath === "CREATOR"
                            ? "border-amber-500 bg-amber-50/50"
                            : "border-secondary-100 hover:border-amber-200 hover:bg-secondary-50"
                            }`}
                    >
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${selectedPath === "CREATOR" ? "bg-amber-100 text-amber-600" : "bg-secondary-100 text-secondary-600"
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
                            <div className="mt-6 p-4 rounded-xl bg-white border border-secondary-200" onClick={(e) => e.stopPropagation()}>
                                <label htmlFor="orgName" className="block text-sm font-medium text-secondary-900 mb-2">
                                    {t("orgNameLabel")}
                                </label>
                                <input
                                    id="orgName"
                                    type="text"
                                    value={orgName}
                                    onChange={(e) => setOrgName(e.target.value)}
                                    placeholder={t("orgNamePlaceholder")}
                                    className="w-full px-4 py-2 rounded-lg border border-secondary-200 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                                />
                            </div>
                        )}
                    </button>
                </div>

                <div className="mt-8 flex justify-end">
                    <button
                        onClick={handleComplete}
                        disabled={!selectedPath || loading}
                        className={`flex items-center gap-2 px-8 py-3 rounded-xl font-medium text-white transition-all ${!selectedPath
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
