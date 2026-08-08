"use client";

import { useState, useEffect, useRef } from "react";
import { Check, ChevronsUpDown, Search, X } from "lucide-react";
import { useTranslations } from "next-intl";

export type Skill = {
    id: number;
    name: string;
    nameAr: string | null;
    category: string;
};

interface SkillSelectorProps {
    selectedSkills: number[];
    onChange: (skills: number[]) => void;
    locale: string;
    maxSelection?: number;
}

export function SkillSelector({ selectedSkills, onChange, locale, maxSelection = 10 }: SkillSelectorProps) {
    const t = useTranslations("profile.edit");
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [skills, setSkills] = useState<Skill[]>([]);
    const [allSkills, setAllSkills] = useState<Skill[]>([]);
    const [loading, setLoading] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Initial fetch
    useEffect(() => {
        const fetchInitial = async () => {
            const res = await fetch("/api/skills");
            if (res.ok) {
                const data = await res.json();
                setAllSkills(data);
                setSkills(data);
            }
        };
        fetchInitial();
    }, []);

    // Fetch on search
    useEffect(() => {
        if (!query.trim()) {
            setSkills(allSkills);
            return;
        }

        const fetchSearch = async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/skills?q=${encodeURIComponent(query)}`);
                if (res.ok) {
                    const data = await res.json();
                    setSkills(data);
                }
            } finally {
                setLoading(false);
            }
        };

        const debounce = setTimeout(fetchSearch, 300);
        return () => clearTimeout(debounce);
    }, [query, allSkills]);

    // Handle outside click
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const toggleSkill = (skillId: number) => {
        if (selectedSkills.includes(skillId)) {
            onChange(selectedSkills.filter(id => id !== skillId));
        } else {
            if (selectedSkills.length >= maxSelection) return;
            onChange([...selectedSkills, skillId]);
        }
        // Don't close immediately so they can select multiple
    };

    const removeSkill = (e: React.MouseEvent, skillId: number) => {
        e.stopPropagation();
        onChange(selectedSkills.filter(id => id !== skillId));
    };

    const getSkillName = (id: number) => {
        const skill = allSkills.find(s => s.id === id);
        if (!skill) return "";
        return locale === "ar" && skill.nameAr ? skill.nameAr : skill.name;
    };

    return (
        <div className="relative w-full" ref={wrapperRef}>
            {/* Selected Skills display & Trigger */}
            <div
                className="min-h-[46px] w-full border border-secondary-200 rounded-xl bg-white px-3 py-2 flex flex-wrap gap-2 items-center cursor-text focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-primary-500 transition-all"
                onClick={() => setOpen(true)}
            >
                {selectedSkills.map(id => (
                    <span
                        key={id}
                        className="inline-flex items-center gap-1.5 pl-3 pr-2 py-1 rounded-full bg-primary-50 text-primary-700 text-sm border border-primary-100"
                    >
                        {getSkillName(id)}
                        <button
                            onClick={(e) => removeSkill(e, id)}
                            aria-label={t("removeSkill")}
                            className="text-primary-400 hover:text-primary-700 hover:bg-primary-100 rounded-full p-0.5 transition-colors"
                        >
                            <X size={14} />
                        </button>
                    </span>
                ))}

                <input
                    type="text"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setOpen(true);
                    }}
                    onFocus={() => setOpen(true)}
                    placeholder={selectedSkills.length === 0 ? t("searchSkillPlaceholder") : ""}
                    className="flex-1 min-w-[120px] bg-transparent outline-none text-sm placeholder:text-secondary-400"
                />

                <button
                    type="button"
                    aria-label={open ? t("closeSkills") : t("openSkills")}
                    className="ml-auto text-secondary-400 hover:text-secondary-600 p-1"
                    onClick={(e) => {
                        e.stopPropagation();
                        setOpen(!open);
                    }}
                >
                    <ChevronsUpDown size={16} />
                </button>
            </div>

            {/* Dropdown Menu */}
            {open && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-secondary-100 rounded-xl shadow-lg z-50 max-h-60 overflow-y-auto py-1">
                    {loading ? (
                        <div className="px-4 py-3 text-sm text-secondary-500 text-center">
                            {locale === "ar" ? "جاري البحث..." : "Searching..."}
                        </div>
                    ) : skills.length === 0 ? (
                        <div className="px-4 py-3 text-sm text-secondary-500 text-center">
                            {locale === "ar" ? "لا توجد نتائج" : "No results found"}
                        </div>
                    ) : (
                        skills.map(skill => {
                            const isSelected = selectedSkills.includes(skill.id);
                            return (
                                <button
                                    key={skill.id}
                                    type="button"
                                    onClick={() => toggleSkill(skill.id)}
                                    className="w-full text-left px-4 py-2.5 text-sm hover:bg-secondary-50 flex items-center justify-between group transition-colors"
                                >
                                    <div className="flex flex-col">
                                        <span className={`font-medium ${isSelected ? 'text-primary-700' : 'text-secondary-900 group-hover:text-primary-600'}`}>
                                            {locale === "ar" && skill.nameAr ? skill.nameAr : skill.name}
                                        </span>
                                        <span className="text-xs text-secondary-400">{skill.category}</span>
                                    </div>
                                    {isSelected && <Check size={16} className="text-primary-600" />}
                                </button>
                            );
                        })
                    )}
                </div>
            )}
        </div>
    );
}
