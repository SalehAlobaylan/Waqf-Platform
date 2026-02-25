"use client";

import { useState } from "react";
import { ProjectCategory } from "@prisma/client";
import { X, Package, Code, Globe, Calendar } from "lucide-react";

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
    { value: "QURAN", label: { en: "Quran Apps", ar: "تطبيقات القرآن" } },
    { value: "PRAYER", label: { en: "Prayer & Salah", ar: "الصلاة" } },
    { value: "CHARITY", label: { en: "Charity & Zakat", ar: "الصدقات والزكاة" } },
    { value: "EDUCATION", label: { en: "Islamic Education", ar: "التعليم الإسلامي" } },
    { value: "COMMUNITY", label: { en: "Community", ar: "المجتمع" } },
    { value: "TOOLS", label: { en: "Tools & Utilities", ar: "الأدوات" } },
];

const timeCommitments = [
    { value: "1-5", label: { en: "< 2 hrs/week", ar: "أقل من ٢ ساعة/أسبوع" } },
    { value: "one-time", label: { en: "One-time task", ar: "مهمة واحدة" } },
    { value: "5-10", label: { en: "5-10 hours/week", ar: "٥-١٠ ساعات/أسبوع" } },
    { value: "10+", label: { en: "10+ hours/week", ar: "+١٠ ساعة/أسبوع" } },
];

const projectTypes = [
    { value: "verified", label: { en: "Verified Organization", ar: "منظمة موثقة" } },
    { value: "community", label: { en: "Community Driven", ar: "مبادرة مجتمعية" } },
];

export function FilterSidebar({ filters, onFilterChange, skills, locale = "en" }: FilterSidebarProps) {
    const [selectedTypes, setSelectedTypes] = useState<string[]>([]);

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
        setSelectedTypes([]);
    };

    const hasFilters = filters.category || filters.skills.length > 0 || filters.language || filters.timeCommitment || selectedTypes.length > 0;

    return (
        <aside className="w-72 hidden lg:flex flex-col border-r border-waqf-border bg-white h-[calc(100vh-65px)] sticky top-[65px] overflow-y-auto">
            <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="font-bold text-lg text-secondary-900">
                        {locale === "ar" ? "التصفية" : "Filters"}
                    </h2>
                    {hasFilters && (
                        <button
                            onClick={clearFilters}
                            className="text-xs font-medium text-primary-600 hover:text-primary-700"
                        >
                            {locale === "ar" ? "مسح الكل" : "Clear All"}
                        </button>
                    )}
                </div>

                {/* Category Filter */}
                <div className="mb-8">
                    <h3 className="text-sm font-semibold text-secondary-900 mb-3 flex items-center gap-2">
                        <Package className="w-4 h-4 text-waqf-muted" />
                        {locale === "ar" ? "الفئة" : "Category"}
                    </h3>
                    <div className="space-y-2">
                        {categories.map((cat) => (
                            <label key={cat.value} className="flex items-center gap-3 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    className="w-4 h-4 rounded border-secondary-300 text-primary-600 focus:ring-primary-600"
                                    checked={filters.category === cat.value}
                                    onChange={() =>
                                        updateFilter("category", filters.category === cat.value ? undefined : cat.value)
                                    }
                                />
                                <span className="text-sm text-secondary-600 group-hover:text-primary-600 transition-colors">
                                    {cat.label[locale === "ar" ? "ar" : "en"]}
                                </span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Skills Filter */}
                <div className="mb-8">
                    <h3 className="text-sm font-semibold text-secondary-900 mb-3 flex items-center gap-2">
                        <Code className="w-4 h-4 text-waqf-muted" />
                        {locale === "ar" ? "المهارات" : "Skills"}
                    </h3>
                    <div className="space-y-2">
                        {skills.slice(0, 8).map((skill) => (
                            <label key={skill.id} className="flex items-center gap-3 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    className="w-4 h-4 rounded border-secondary-300 text-primary-600 focus:ring-primary-600"
                                    checked={filters.skills.includes(skill.id.toString())}
                                    onChange={() => toggleSkill(skill.id.toString())}
                                />
                                <span className="text-sm text-secondary-600 group-hover:text-primary-600 transition-colors">
                                    {locale === "ar" ? skill.nameAr : skill.name}
                                </span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Project Type */}
                <div className="mb-8">
                    <h3 className="text-sm font-semibold text-secondary-900 mb-3 flex items-center gap-2">
                        <Globe className="w-4 h-4 text-waqf-muted" />
                        {locale === "ar" ? "نوع المشروع" : "Project Type"}
                    </h3>
                    <div className="space-y-2">
                        {projectTypes.map((type) => (
                            <label key={type.value} className="flex items-center gap-3 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    className="w-4 h-4 rounded border-secondary-300 text-primary-600 focus:ring-primary-600"
                                    checked={selectedTypes.includes(type.value)}
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            setSelectedTypes([...selectedTypes, type.value]);
                                        } else {
                                            setSelectedTypes(selectedTypes.filter((t) => t !== type.value));
                                        }
                                    }}
                                />
                                <span className="text-sm text-secondary-600 group-hover:text-primary-600 transition-colors">
                                    {type.label[locale === "ar" ? "ar" : "en"]}
                                </span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Time Commitment */}
                <div>
                    <h3 className="text-sm font-semibold text-secondary-900 mb-3 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-waqf-muted" />
                        {locale === "ar" ? "الالتزام" : "Commitment"}
                    </h3>
                    <div className="space-y-2">
                        {timeCommitments.map((tc) => (
                            <label key={tc.value} className="flex items-center gap-3 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    className="w-4 h-4 rounded border-secondary-300 text-primary-600 focus:ring-primary-600"
                                    checked={filters.timeCommitment === tc.value}
                                    onChange={() =>
                                        updateFilter("timeCommitment", filters.timeCommitment === tc.value ? undefined : tc.value)
                                    }
                                />
                                <span className="text-sm text-secondary-600 group-hover:text-primary-600 transition-colors">
                                    {tc.label[locale === "ar" ? "ar" : "en"]}
                                </span>
                            </label>
                        ))}
                    </div>
                </div>
            </div>

            {/* Active Filters */}
            {hasFilters && (
                <div className="px-6 pb-6 flex flex-wrap gap-2">
                    {filters.category && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary-50 text-primary-700 rounded-lg text-xs font-medium">
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
                                className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary-50 text-primary-700 rounded-lg text-xs font-medium"
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
