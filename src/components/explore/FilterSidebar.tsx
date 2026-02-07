"use client";

import { useState } from "react";
import { ProjectCategory } from "@prisma/client";
import { X, Filter, ChevronDown } from "lucide-react";

interface FilterSidebarProps {
    filters: {
        category?: string;
        skills: string[];
        language?: string;
        timeCommitment?: string;
    };
    onFilterChange: (filters: FilterSidebarProps["filters"]) => void;
    skills: Array<{ id: number; name: string; nameAr: string; category: string }>;
    locale?: string;
}

const categories: { value: ProjectCategory; label: { en: string; ar: string } }[] = [
    { value: "QURAN", label: { en: "Quran", ar: "القرآن" } },
    { value: "PRAYER", label: { en: "Prayer", ar: "الصلاة" } },
    { value: "CHARITY", label: { en: "Charity", ar: "الصدقات" } },
    { value: "EDUCATION", label: { en: "Education", ar: "التعليم" } },
    { value: "COMMUNITY", label: { en: "Community", ar: "المجتمع" } },
    { value: "TOOLS", label: { en: "Tools", ar: "الأدوات" } },
];

const timeCommitments = [
    { value: "1-5", label: { en: "1-5 hours/week", ar: "١-٥ ساعات/أسبوع" } },
    { value: "5-10", label: { en: "5-10 hours/week", ar: "٥-١٠ ساعات/أسبوع" } },
    { value: "10-20", label: { en: "10-20 hours/week", ar: "١٠-٢٠ ساعة/أسبوع" } },
    { value: "20+", label: { en: "20+ hours/week", ar: "+٢٠ ساعة/أسبوع" } },
];

export function FilterSidebar({ filters, onFilterChange, skills, locale = "en" }: FilterSidebarProps) {
    const [expandedSections, setExpandedSections] = useState<string[]>(["category", "skills"]);

    const toggleSection = (section: string) => {
        setExpandedSections((prev) =>
            prev.includes(section) ? prev.filter((s) => s !== section) : [...prev, section]
        );
    };

    const updateFilter = (key: keyof FilterSidebarProps["filters"], value: string | string[] | undefined) => {
        onFilterChange({ ...filters, [key]: value });
    };

    const toggleSkill = (skillId: string) => {
        const newSkills = filters.skills.includes(skillId)
            ? filters.skills.filter((s) => s !== skillId)
            : [...filters.skills, skillId];
        updateFilter("skills", newSkills);
    };

    const clearFilters = () => {
        onFilterChange({ skills: [] });
    };

    const hasFilters = filters.category || filters.skills.length > 0 || filters.language || filters.timeCommitment;

    return (
        <aside className="w-full lg:w-72 shrink-0">
            <div className="bg-white rounded-xl border border-secondary-100 p-4 sticky top-4">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <h2 className="font-semibold text-secondary-900 flex items-center gap-2">
                        <Filter className="w-4 h-4" />
                        {locale === "ar" ? "التصفية" : "Filters"}
                    </h2>
                    {hasFilters && (
                        <button
                            onClick={clearFilters}
                            className="text-sm text-primary-600 hover:text-primary-700"
                        >
                            {locale === "ar" ? "مسح الكل" : "Clear all"}
                        </button>
                    )}
                </div>

                {/* Category */}
                <div className="border-t border-secondary-100 py-4">
                    <button
                        onClick={() => toggleSection("category")}
                        className="flex items-center justify-between w-full text-sm font-medium text-secondary-700"
                    >
                        {locale === "ar" ? "الفئة" : "Category"}
                        <ChevronDown
                            className={`w-4 h-4 transition-transform ${expandedSections.includes("category") ? "rotate-180" : ""}`}
                        />
                    </button>
                    {expandedSections.includes("category") && (
                        <div className="mt-3 space-y-2">
                            {categories.map((cat) => (
                                <label key={cat.value} className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="category"
                                        checked={filters.category === cat.value}
                                        onChange={() => updateFilter("category", cat.value)}
                                        className="w-4 h-4 text-primary-600 border-secondary-300 focus:ring-primary-500"
                                    />
                                    <span className="text-sm text-secondary-600">
                                        {cat.label[locale === "ar" ? "ar" : "en"]}
                                    </span>
                                </label>
                            ))}
                            {filters.category && (
                                <button
                                    onClick={() => updateFilter("category", undefined)}
                                    className="text-xs text-secondary-500 hover:text-secondary-700"
                                >
                                    {locale === "ar" ? "مسح الفئة" : "Clear category"}
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Skills */}
                <div className="border-t border-secondary-100 py-4">
                    <button
                        onClick={() => toggleSection("skills")}
                        className="flex items-center justify-between w-full text-sm font-medium text-secondary-700"
                    >
                        {locale === "ar" ? "المهارات" : "Skills"}
                        <ChevronDown
                            className={`w-4 h-4 transition-transform ${expandedSections.includes("skills") ? "rotate-180" : ""}`}
                        />
                    </button>
                    {expandedSections.includes("skills") && (
                        <div className="mt-3 space-y-2 max-h-48 overflow-y-auto">
                            {skills.slice(0, 15).map((skill) => (
                                <label key={skill.id} className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={filters.skills.includes(skill.id.toString())}
                                        onChange={() => toggleSkill(skill.id.toString())}
                                        className="w-4 h-4 text-primary-600 border-secondary-300 rounded focus:ring-primary-500"
                                    />
                                    <span className="text-sm text-secondary-600">
                                        {locale === "ar" ? skill.nameAr : skill.name}
                                    </span>
                                </label>
                            ))}
                        </div>
                    )}
                </div>

                {/* Time Commitment */}
                <div className="border-t border-secondary-100 py-4">
                    <button
                        onClick={() => toggleSection("time")}
                        className="flex items-center justify-between w-full text-sm font-medium text-secondary-700"
                    >
                        {locale === "ar" ? "الالتزام بالوقت" : "Time Commitment"}
                        <ChevronDown
                            className={`w-4 h-4 transition-transform ${expandedSections.includes("time") ? "rotate-180" : ""}`}
                        />
                    </button>
                    {expandedSections.includes("time") && (
                        <div className="mt-3 space-y-2">
                            {timeCommitments.map((tc) => (
                                <label key={tc.value} className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="timeCommitment"
                                        checked={filters.timeCommitment === tc.value}
                                        onChange={() => updateFilter("timeCommitment", tc.value)}
                                        className="w-4 h-4 text-primary-600 border-secondary-300 focus:ring-primary-500"
                                    />
                                    <span className="text-sm text-secondary-600">
                                        {tc.label[locale === "ar" ? "ar" : "en"]}
                                    </span>
                                </label>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Active Filters */}
            {hasFilters && (
                <div className="mt-4 flex flex-wrap gap-2">
                    {filters.category && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary-50 text-primary-700 rounded-lg text-sm">
                            {categories.find((c) => c.value === filters.category)?.label[locale === "ar" ? "ar" : "en"]}
                            <button onClick={() => updateFilter("category", undefined)}>
                                <X className="w-3 h-3" />
                            </button>
                        </span>
                    )}
                    {filters.skills.map((skillId) => {
                        const skill = skills.find((s) => s.id.toString() === skillId);
                        return (
                            <span
                                key={skillId}
                                className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary-50 text-primary-700 rounded-lg text-sm"
                            >
                                {locale === "ar" ? skill?.nameAr : skill?.name}
                                <button onClick={() => toggleSkill(skillId)}>
                                    <X className="w-3 h-3" />
                                </button>
                            </span>
                        );
                    })}
                </div>
            )}
        </aside>
    );
}
