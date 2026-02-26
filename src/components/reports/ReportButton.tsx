"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Flag } from "lucide-react";
import { ReportModal } from "@/components/reports/ReportModal";

interface ReportButtonProps {
    targetType: "PROJECT" | "USER" | "APPLICATION";
    targetId: string;
}

export function ReportButton({ targetType, targetId }: ReportButtonProps) {
    const t = useTranslations("reports");
    const [open, setOpen] = useState(false);

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 border border-secondary-200 rounded-xl bg-white hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-all text-sm font-medium text-secondary-500"
            >
                <Flag className="w-4 h-4" />
                {targetType === "PROJECT" ? t("reportProject") : t("reportUser")}
            </button>
            <ReportModal
                targetType={targetType}
                targetId={targetId}
                isOpen={open}
                onClose={() => setOpen(false)}
            />
        </>
    );
}
