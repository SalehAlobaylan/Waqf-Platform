"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";

interface SimilarProject {
    id: string;
    slug: string;
    title: string;
    category: string;
    skills: Array<{ skill: { name: string; nameAr: string | null } }>;
}

const categoryEmoji: Record<string, string> = {
    QURAN: "📖",
    PRAYER: "🕌",
    CHARITY: "🤲",
    EDUCATION: "📚",
    COMMUNITY: "👥",
    TOOLS: "⚙️",
};

export function SimilarProjects({ projectId, locale }: { projectId: string; locale: string }) {
    const t = useTranslations("projects");
    const [projects, setProjects] = useState<SimilarProject[]>([]);

    useEffect(() => {
        fetch(`/api/projects/${projectId}/similar`)
            .then(res => res.ok ? res.json() : [])
            .then(setProjects)
            .catch(() => setProjects([]));
    }, [projectId]);

    if (projects.length === 0) return null;

    return (
        <div className="bg-white rounded-2xl border border-waqf-border p-6">
            <h3 className="text-sm font-semibold text-secondary-900 mb-4">
                {t("similarProjects")}
            </h3>
            <div className="space-y-3">
                {projects.map(p => (
                    <Link
                        key={p.id}
                        href={`/${locale}/projects/${p.slug}`}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary-50 transition-colors"
                    >
                        <div className="w-9 h-9 bg-secondary-50 rounded-lg flex items-center justify-center text-sm">
                            {categoryEmoji[p.category] || "📦"}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-secondary-900 truncate">{p.title}</p>
                            <p className="text-xs text-secondary-500">
                                {p.skills.slice(0, 2).map(s => locale === "ar" ? s.skill.nameAr || s.skill.name : s.skill.name).join(" · ")}
                            </p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
