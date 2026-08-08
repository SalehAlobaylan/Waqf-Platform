"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

export default function NotFound() {
    const t = useTranslations("projects");
    const locale = useLocale();
    return (
        <div className="min-h-screen bg-waqf-bg flex items-center justify-center p-6">
            <div className="max-w-md w-full bg-white rounded-2xl border border-secondary-100 p-8 text-center shadow-sm">
                <h1 className="text-2xl font-bold text-secondary-900 mb-2">
                    {t("notFoundTitle")}
                </h1>
                <p className="text-secondary-500 mb-6">
                    {t("notFoundDescription")}
                </p>
                <Link
                    href={`/${locale}/explore`}
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-primary-600 text-white text-sm font-medium rounded-xl hover:bg-primary-700 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
                    {t("backToExplore")}
                </Link>
            </div>
        </div>
    );
}
