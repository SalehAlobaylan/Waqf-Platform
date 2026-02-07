import Link from "next/link";
import { Clock, Users, Tag } from "lucide-react";
import { ProjectCategory, ProjectStatus } from "@prisma/client";

interface ProjectCardProps {
    project: {
        id: string;
        slug: string;
        title: string;
        description: string;
        category: ProjectCategory;
        status: ProjectStatus;
        timeCommitment?: string | null;
        createdAt: Date;
        _count?: {
            applications: number;
        };
        skills: Array<{
            skill: {
                name: string;
                nameAr: string | null;
            };
            isRequired: boolean;
        }>;
        owner: {
            name: string;
            avatar?: string | null;
        };
    };
    locale?: string;
}

const categoryColors: Record<ProjectCategory, string> = {
    QURAN: "bg-emerald-100 text-emerald-700",
    PRAYER: "bg-blue-100 text-blue-700",
    CHARITY: "bg-rose-100 text-rose-700",
    EDUCATION: "bg-amber-100 text-amber-700",
    COMMUNITY: "bg-purple-100 text-purple-700",
    TOOLS: "bg-slate-100 text-slate-700",
};

const categoryLabels: Record<ProjectCategory, { en: string; ar: string }> = {
    QURAN: { en: "Quran", ar: "القرآن" },
    PRAYER: { en: "Prayer", ar: "الصلاة" },
    CHARITY: { en: "Charity", ar: "الصدقات" },
    EDUCATION: { en: "Education", ar: "التعليم" },
    COMMUNITY: { en: "Community", ar: "المجتمع" },
    TOOLS: { en: "Tools", ar: "الأدوات" },
};

export function ProjectCard({ project, locale = "en" }: ProjectCardProps) {
    const topSkills = project.skills.slice(0, 3);
    const remainingCount = project.skills.length - 3;

    return (
        <Link
            href={`/${locale}/projects/${project.slug}`}
            className="group block bg-white rounded-xl border border-secondary-100 p-6 hover:shadow-lg hover:border-primary-200 transition-all duration-200"
        >
            {/* Header */}
            <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-secondary-900 group-hover:text-primary-600 transition-colors line-clamp-1">
                        {project.title}
                    </h3>
                    <p className="text-sm text-secondary-500 mt-1">
                        by {project.owner.name}
                    </p>
                </div>
                <span className={`shrink-0 px-2.5 py-1 text-xs font-medium rounded-full ${categoryColors[project.category]}`}>
                    {categoryLabels[project.category][locale === "ar" ? "ar" : "en"]}
                </span>
            </div>

            {/* Description */}
            <p className="text-sm text-secondary-600 line-clamp-2 mb-4">
                {project.description}
            </p>

            {/* Skills */}
            <div className="flex flex-wrap gap-2 mb-4">
                {topSkills.map((ps, index) => (
                    <span
                        key={index}
                        className={`px-2.5 py-1 text-xs rounded-lg ${ps.isRequired
                            ? "bg-primary-50 text-primary-700 border border-primary-200"
                            : "bg-secondary-50 text-secondary-600"
                            }`}
                    >
                        {locale === "ar" ? (ps.skill.nameAr || ps.skill.name) : ps.skill.name}
                    </span>
                ))}
                {remainingCount > 0 && (
                    <span className="px-2.5 py-1 text-xs text-secondary-500">
                        +{remainingCount} more
                    </span>
                )}
            </div>

            {/* Footer */}
            <div className="flex items-center gap-4 text-xs text-secondary-500 pt-4 border-t border-secondary-100">
                {project.timeCommitment && (
                    <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {project.timeCommitment}
                    </span>
                )}
                <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    {project._count?.applications || 0} applicants
                </span>
                <span className="flex items-center gap-1 ms-auto">
                    <Tag className="w-3.5 h-3.5" />
                    {project.status}
                </span>
            </div>
        </Link>
    );
}
