"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowRight, SquareArrowOutUpRight } from "lucide-react";
import { getCategoryLabel, getCategoryTint } from "@/lib/categories";
import { cn } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/Badge";

interface ProjectCardProps {
    project: {
        id: string;
        slug: string;
        title: string;
        description: string;
        category: string;
        status: string;
        source?: string;
        tags?: string[];
        timeCommitment?: string | null;
        featured?: boolean;
        _count?: { applications: number };
        skills: Array<{ skill: { name: string; nameAr: string | null }; isRequired: boolean }>;
        owner: { name: string; image: string | null } | null;
    };
    locale: string;
}

export function ProjectCard({ project, locale }: ProjectCardProps) {
    const t = useTranslations("projectCard");
    const tint = getCategoryTint(project.category);
    const skills = [
        ...project.skills.filter((s) => s.isRequired),
        ...project.skills.filter((s) => !s.isRequired),
    ]
        .slice(0, 3)
        .map((s) => (locale === "ar" ? s.skill.nameAr || s.skill.name : s.skill.name));
    const isExternal = project.source === "EXTERNAL";

    return (
        <Link
            href={`/${locale}/projects/${project.slug}`}
            className="reveal group relative flex flex-col rounded-lg border border-waqf-border bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary-300 hover:shadow-[0_12px_32px_-16px_rgba(8,37,32,0.25)]"
        >
            <span
                aria-hidden
                className="absolute inset-x-6 top-0 h-0.5 bg-accent-500 scale-x-0 group-hover:scale-x-100 origin-left rtl:origin-right transition-transform duration-300"
            />

            <div className="flex items-center justify-between gap-3">
                <StatusBadge status={project.status} locale={locale} />
                {isExternal && (
                    <span
                        className="inline-flex items-center gap-1 text-xs font-medium text-secondary-500"
                        title={t("curatedExternalProject")}
                    >
                        <SquareArrowOutUpRight className="w-3.5 h-3.5" />
                        {t("external")}
                    </span>
                )}
            </div>

            <div className="mt-4 flex items-center gap-2 text-xs">
                <span className={cn("rounded px-1.5 py-0.5 font-semibold", tint.bg, tint.text)}>
                    {getCategoryLabel(project.category, locale)}
                </span>
                <span className="truncate text-secondary-400">
                    {project.owner?.name ?? (isExternal ? "Curated" : "—")}
                </span>
            </div>

            <h3 className="mt-3 text-lg font-bold text-secondary-900 leading-tight transition-colors group-hover:text-primary-700">
                {project.title}
            </h3>
            <p className="mt-2 text-sm text-secondary-500 line-clamp-2 leading-relaxed flex-1">
                {project.description}
            </p>

            {skills.length > 0 && (
                <p className="mt-4 text-sm text-secondary-500 truncate">
                    {skills.join(" · ")}
                </p>
            )}

            <div className="mt-5 pt-4 border-t border-waqf-border flex items-center justify-between">
                <span className="text-xs tabular-nums text-secondary-400">
                    {project._count?.applications ?? 0}{" "}
                    {locale === "ar" ? "متقدم" : "applicants"}
                </span>
                <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary-600">
                    {t("contribute")}
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 rtl:-scale-x-100 rtl:group-hover:-translate-x-0.5" />
                </span>
            </div>
        </Link>
    );
}
