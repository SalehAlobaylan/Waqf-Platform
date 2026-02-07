"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { Globe } from "lucide-react";

export function LanguageSwitcher() {
    const t = useTranslations("language");
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname();

    const toggleLocale = () => {
        const newLocale = locale === "ar" ? "en" : "ar";

        // Replace the locale segment in the pathname
        const segments = pathname.split("/");
        segments[1] = newLocale;
        const newPath = segments.join("/");

        router.push(newPath);
    };

    return (
        <button
            onClick={toggleLocale}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-secondary-200 hover:border-primary-400 hover:bg-primary-50 transition-colors text-sm font-medium text-secondary-600 hover:text-primary-600"
            aria-label={t("switch")}
        >
            <Globe size={16} />
            <span>{locale === "ar" ? t("en") : t("ar")}</span>
        </button>
    );
}
