import { Code2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface OpenSourceBadgeProps {
    locale?: string;
    className?: string;
    variant?: "subtle" | "solid";
}

/**
 * Generic open-source badge. Rendered for any Project where
 * `isOpenSource === true` or a public repository URL is present.
 * No toolkit-specific branching.
 */
export function OpenSourceBadge({ locale, className, variant = "subtle" }: OpenSourceBadgeProps) {
    const isAr = locale === "ar";
    const label = isAr ? "مفتوح المصدر" : "Open Source";

    if (variant === "solid") {
        return (
            <span
                className={cn(
                    "inline-flex items-center gap-1.5 rounded-full bg-primary-600 px-2.5 py-1 text-xs font-semibold text-white",
                    className
                )}
            >
                <Code2 className="h-3.5 w-3.5" />
                {label}
            </span>
        );
    }

    return (
        <span
            className={cn(
                "inline-flex items-center gap-1.5 rounded-full border border-primary-200 bg-primary-50 px-2.5 py-1 text-xs font-semibold text-primary-700",
                className
            )}
        >
            <Code2 className="h-3.5 w-3.5" />
            {label}
        </span>
    );
}
