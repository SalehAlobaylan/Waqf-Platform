export type CategoryTone = "primary" | "accent" | "blue" | "emerald";

interface CategoryMeta {
    tone: CategoryTone;
    en: string;
    ar: string;
}

// Single source of truth for project categories.
// Tints follow DESIGN.md: Quran=primary, Charity=accent, Education=blue, Finance=emerald.
export const categories: Record<string, CategoryMeta> = {
    QURAN: { tone: "primary", en: "Quran & Sunnah", ar: "القرآن والسنة" },
    PRAYER: { tone: "primary", en: "Prayer", ar: "الصلاة" },
    CHARITY: { tone: "accent", en: "Charity & Zakat", ar: "الزكاة والصدقات" },
    EDUCATION: { tone: "blue", en: "Education", ar: "التعليم" },
    COMMUNITY: { tone: "primary", en: "Community", ar: "المجتمع" },
    TOOLS: { tone: "emerald", en: "Finance", ar: "المالية" },
};

const tintClasses: Record<
    CategoryTone,
    { bg: string; text: string; border: string }
> = {
    primary: {
        bg: "bg-primary-50",
        text: "text-primary-700",
        border: "border-primary-200",
    },
    accent: {
        bg: "bg-accent-50",
        text: "text-accent-700",
        border: "border-accent-200",
    },
    blue: {
        bg: "bg-blue-50",
        text: "text-blue-700",
        border: "border-blue-200",
    },
    emerald: {
        bg: "bg-emerald-50",
        text: "text-emerald-700",
        border: "border-emerald-200",
    },
};

export function getCategory(category: string): CategoryMeta {
    return (
        categories[category] ?? {
            tone: "primary",
            en: category,
            ar: category,
        }
    );
}

export function getCategoryLabel(category: string, locale: string): string {
    const meta = getCategory(category);
    return locale === "ar" ? meta.ar : meta.en;
}

export function getCategoryTint(category: string) {
    return tintClasses[getCategory(category).tone];
}
