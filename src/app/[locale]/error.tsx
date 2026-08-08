"use client";

import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { TriangleAlert } from "lucide-react";

export default function ErrorBoundary({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    const t = useTranslations("error");

    useEffect(() => {
        console.error("[error.tsx]", error);
    }, [error]);

    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
            <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mb-6">
                <TriangleAlert className="w-8 h-8" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-secondary-900 mb-3">
                {t("title")}
            </h1>
            <p className="text-secondary-600 max-w-md mb-8">{t("description")}</p>
            <button
                onClick={reset}
                className="inline-flex items-center justify-center rounded-xl h-12 px-6 bg-primary-600 hover:bg-primary-700 text-white font-bold shadow-lg shadow-primary-600/25 transition-all"
            >
                {t("retry")}
            </button>
        </div>
    );
}
