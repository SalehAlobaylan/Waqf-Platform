import { SkillLevel } from "@prisma/client";
import { useTranslations } from "next-intl";

interface SkillWithLevel {
    id: number;
    name: string;
    nameAr: string;
    category: string;
    level: SkillLevel;
}

interface SkillsMatrixProps {
    skills: SkillWithLevel[];
    locale?: string;
}

const levelColors: Record<SkillLevel, string> = {
    BEGINNER: "bg-secondary-100 text-secondary-700 border-waqf-border",
    INTERMEDIATE: "bg-primary-50 text-primary-700 border-primary-200",
    ADVANCED: "bg-accent-50 text-accent-700 border-accent-200",
    EXPERT: "bg-accent-100 text-accent-800 border-accent-300",
};

const levelLabels: Record<SkillLevel, { en: string; ar: string }> = {
    BEGINNER: { en: "Beginner", ar: "مبتدئ" },
    INTERMEDIATE: { en: "Intermediate", ar: "متوسط" },
    ADVANCED: { en: "Advanced", ar: "متقدم" },
    EXPERT: { en: "Expert", ar: "خبير" },
};

export function SkillsMatrix({ skills, locale = "en" }: SkillsMatrixProps) {
    const t = useTranslations("profile.edit");
    // Group skills by category
    const groupedSkills = skills.reduce((acc, skill) => {
        if (!acc[skill.category]) {
            acc[skill.category] = [];
        }
        acc[skill.category].push(skill);
        return acc;
    }, {} as Record<string, SkillWithLevel[]>);

    const categoryLabels: Record<string, { en: string; ar: string }> = {
        frontend: { en: "Frontend", ar: "الواجهة الأمامية" },
        backend: { en: "Backend", ar: "الخلفية" },
        mobile: { en: "Mobile", ar: "تطبيقات الجوال" },
        devops: { en: "DevOps", ar: "البنية التحتية" },
        database: { en: "Database", ar: "قواعد البيانات" },
        design: { en: "Design", ar: "التصميم" },
        other: { en: "Other", ar: "أخرى" },
    };

    if (skills.length === 0) {
        return (
            <div className="bg-white rounded-xl border border-secondary-100 p-6">
                <h3 className="text-lg font-semibold text-secondary-900 mb-4">
                    {t("skills")}
                </h3>
                <p className="text-secondary-500 text-sm">
                    {locale === "ar" ? "لم تتم إضافة مهارات بعد" : "No skills added yet"}
                </p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl border border-secondary-100 p-6">
            <h3 className="text-lg font-semibold text-secondary-900 mb-4">
                {t("skills")}
            </h3>

            <div className="space-y-6">
                {Object.entries(groupedSkills).map(([category, categorySkills]) => (
                    <div key={category}>
                        <h4 className="text-sm font-medium text-secondary-600 mb-3">
                            {categoryLabels[category.toLowerCase()]?.[locale === "ar" ? "ar" : "en"] || category}
                        </h4>
                        <div className="flex flex-wrap gap-2">
                            {categorySkills.map((skill) => (
                                <div
                                    key={skill.id}
                                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border ${levelColors[skill.level]} text-sm`}
                                >
                                    <span className="font-medium">
                                        {locale === "ar" ? skill.nameAr : skill.name}
                                    </span>
                                    <span className="text-xs opacity-80">
                                        {levelLabels[skill.level][locale === "ar" ? "ar" : "en"]}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
