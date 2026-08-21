"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { getCategoryLabel, getCategoryTint } from "@/lib/categories";
import { cn } from "@/lib/utils";

interface SimilarProject {
    id: string;
    slug: string;
    title: string;
    category: string;
    skills: Array<{ skill: { name: string; nameAr: string | null } }>;
}

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
        <div className="bg-white rounded-lg border border-waqf-border p-6">
            <h3 className="text-sm font-semibold text-secondary-900 mb-4">
                {t("similarProjects")}
            </h3>
            <ul className="divide-y divide-waqf-border">
                {projects.map(p => (
                    <li key={p.id}>
                        <Link
                            href={`/${locale}/projects/${p.slug}`}
                            className="group flex items-center gap-3 py-3"
                        >
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-secondary-900 truncate group-hover:text-primary-700 transition-colors">
                                    {p.title}
                                </p>
                                <p className="text-xs text-secondary-500 truncate">
                                    {p.skills.slice(0, 2).map(s => locale === "ar" ? s.skill.nameAr || s.skill.name : s.skill.name).join(" · ")}
                                </p>
                            </div>
                            <span
                                aria-hidden
                                className={cn(
                                    "shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold",
                                    getCategoryTint(p.category).bg,
                                    getCategoryTint(p.category).text
                                )}
                            >
                                {getCategoryLabel(p.category, locale)}
                            </span>
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}
