import { cn } from "@/lib/utils";

export interface ToolPreviewItem {
    label: string;
    labelAr?: string;
    description?: string;
    descriptionAr?: string;
    icon?: string;
}

interface ShowcasePreviewProps {
    screenshots: string[];
    toolsPreview: ToolPreviewItem[] | null;
    projectTitle: string;
    locale: string;
    fallbackTools?: Array<{ name: string; nameAr?: string | null }>;
}

function getLabel(item: ToolPreviewItem, locale: string): string {
    if (locale === "ar" && item.labelAr) return item.labelAr;
    return item.label;
}

/**
 * Generic preview: screenshots + tool chips.
 * Does not import toolkit runtime components. Shows static metadata
 * (images, chip list) and degrades to skills-derived chips.
 *
 * Toolkit example:
 *   [ Prayer Times ] [ Qibla ] [ Hijri Calendar ] [ Zakat Calculator ]
 * For other projects this renders whatever `toolsPreview` is stored as,
 * or falls back to filtered skill names.
 */
export function ShowcasePreview({
    screenshots,
    toolsPreview,
    projectTitle,
    locale,
    fallbackTools,
}: ShowcasePreviewProps) {
    const hasTools = toolsPreview && toolsPreview.length > 0;
    const fallbackChips = fallbackTools?.slice(0, 8) ?? [];
    const chips: string[] = hasTools
        ? toolsPreview!.map((t) => getLabel(t, locale))
        : fallbackChips.map((s) => (locale === "ar" ? s.nameAr || s.name : s.name));

    const isAr = locale === "ar";

    return (
        <div className="space-y-4">
            {/* Screenshots — static images, not live app embed */}
            {screenshots.length > 0 && (
                <div className="grid grid-cols-2 gap-3">
                    {screenshots.slice(0, 4).map((src, i) => (
                        <div
                            key={src + i}
                            className="relative overflow-hidden rounded-lg border border-waqf-border bg-white"
                        >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={src}
                                alt={`${projectTitle} preview ${i + 1}`}
                                className="h-36 w-full object-cover md:h-40"
                                loading="lazy"
                            />
                        </div>
                    ))}
                </div>
            )}

            {/* Utilities / tools chips */}
            {chips.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {chips.slice(0, 8).map((label) => (
                        <span
                            key={label}
                            className={cn(
                                "inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-medium",
                                "border-waqf-border bg-white text-secondary-700"
                            )}
                        >
                            {label}
                        </span>
                    ))}
                    {chips.length > 8 && (
                        <span className="inline-flex items-center px-2 py-1.5 text-xs text-secondary-500">
                            +{chips.length - 8} {isAr ? "المزيد" : "more"}
                        </span>
                    )}
                </div>
            )}

            {screenshots.length === 0 && chips.length === 0 && (
                <p className="text-sm text-secondary-500">
                    {isAr
                        ? "لا توجد معاينات متاحة حالياً."
                        : "No previews available yet."}
                </p>
            )}
        </div>
    );
}
