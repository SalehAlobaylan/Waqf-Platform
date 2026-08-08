"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { ApplyModal } from "./ApplyModal";

interface ApplyButtonProps {
    project: {
        id: string;
        title: string;
        slug: string;
    };
    existingApplicationId?: string | null;
}

export function ApplyButton({ project, existingApplicationId }: ApplyButtonProps) {
    const t = useTranslations("projectDetail");
    const locale = useLocale();
    const [isOpen, setIsOpen] = useState(false);

    if (existingApplicationId) {
        return (
            <Link
                href={`/${locale}/dashboard/applications/${existingApplicationId}`}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 transition-colors shadow-md shadow-primary-600/20"
            >
                {t("viewApplication")}
            </Link>
        );
    }

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 transition-colors shadow-md shadow-primary-600/20"
            >
                {t("contributeNow")}
            </button>
            <ApplyModal
                project={project}
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
            />
        </>
    );
}
