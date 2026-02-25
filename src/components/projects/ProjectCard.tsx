"use client";

import Link from "next/link";
import { BookOpen, Heart, Bookmark, CheckCircle } from "lucide-react";

interface ProjectCardProps {
    project: {
        id: string;
        slug: string;
        title: string;
        description: string;
        category: string;
        status: string;
        timeCommitment?: string | null;
        featured?: boolean;
        _count?: { applications: number };
        skills: Array<{ skill: { name: string; nameAr: string | null }; isRequired: boolean }>;
        owner: { name: string; avatar: string | null };
    };
    locale: string;
}

const categoryIcons: Record<string, { emoji: string; bgClass: string }> = {
    QURAN: { emoji: "📖", bgClass: "bg-indigo-50" },
    PRAYER: { emoji: "🕌", bgClass: "bg-emerald-50" },
    CHARITY: { emoji: "🤲", bgClass: "bg-amber-50" },
    EDUCATION: { emoji: "📚", bgClass: "bg-blue-50" },
    COMMUNITY: { emoji: "👥", bgClass: "bg-purple-50" },
    TOOLS: { emoji: "⚙️", bgClass: "bg-slate-50" },
};

export function ProjectCard({ project, locale }: ProjectCardProps) {
    const icon = categoryIcons[project.category] || { emoji: "📦", bgClass: "bg-gray-50" };
    const requiredSkills = project.skills.filter((s) => s.isRequired).slice(0, 3);
    const optionalSkills = project.skills.filter((s) => !s.isRequired).slice(0, 2);

    return (
        <Link
            href={`/${locale}/projects/${project.slug}`}
            className="group flex flex-col rounded-2xl bg-white border border-waqf-border hover:border-primary-600/40 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden cursor-pointer"
        >
            {/* Card Header */}
            <div className="p-6 flex-1">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 ${icon.bgClass} rounded-xl flex items-center justify-center text-lg`}>
                            {icon.emoji}
                        </div>
                        <div>
                            <div className="flex items-center gap-1.5">
                                <span className="text-xs font-medium text-secondary-500">{project.owner.name}</span>
                                <CheckCircle className="w-3.5 h-3.5 text-primary-600" />
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={(e) => { e.preventDefault(); }}
                        className="text-secondary-300 hover:text-accent-500 transition-colors p-1"
                    >
                        <Bookmark className="w-5 h-5" />
                    </button>
                </div>

                <h3 className="text-lg font-bold text-secondary-900 mb-2 group-hover:text-primary-600 transition-colors leading-tight">
                    {project.title}
                </h3>
                <p className="text-sm text-secondary-500 line-clamp-2 leading-relaxed mb-4">
                    {project.description}
                </p>

                {/* Skills */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                    {requiredSkills.map((s, i) => (
                        <span
                            key={i}
                            className="px-2.5 py-0.5 text-xs font-medium rounded-md bg-primary-50 text-primary-700"
                        >
                            {locale === "ar" ? s.skill.nameAr || s.skill.name : s.skill.name}
                        </span>
                    ))}
                    {optionalSkills.map((s, i) => (
                        <span
                            key={`opt-${i}`}
                            className="px-2.5 py-0.5 text-xs font-medium rounded-md bg-secondary-100 text-secondary-600"
                        >
                            {locale === "ar" ? s.skill.nameAr || s.skill.name : s.skill.name}
                        </span>
                    ))}
                </div>

                {/* Sadaqah Jariyah Impact Badge */}
                <div className="flex items-center gap-1.5 text-xs text-accent-600">
                    <Heart className="w-3.5 h-3.5" fill="currentColor" />
                    <span className="font-medium">
                        {locale === "ar" ? "تأثير صدقة جارية" : "Sadaqah Jariyah Impact"}
                    </span>
                </div>
            </div>

            {/* Card Footer */}
            <div className="px-6 py-4 border-t border-waqf-border flex items-center justify-between bg-secondary-50/50">
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    <span className="text-xs text-secondary-500">
                        {locale === "ar" ? "نشط مؤخراً" : "Active 2d ago"}
                    </span>
                </div>
                <span className="text-xs font-bold text-primary-600 group-hover:underline">
                    {locale === "ar" ? "ساهم" : "Contribute →"}
                </span>
            </div>
        </Link>
    );
}
