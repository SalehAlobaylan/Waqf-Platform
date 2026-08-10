"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { CheckCheck, Loader2 } from "lucide-react";
import { apiFetch } from "@/lib/api/client";
import { toast } from "@/lib/toast";
import { translateApiError } from "@/lib/i18n/client-errors";

interface MarkAllReadButtonProps {
    label: string;
}

export function MarkAllReadButton({ label }: MarkAllReadButtonProps) {
    const router = useRouter();
    const tGlobal = useTranslations();
    const [isLoading, setIsLoading] = useState(false);

    const handleClick = async () => {
        if (isLoading) return;
        setIsLoading(true);
        try {
            await apiFetch("/api/notifications", {
                method: "PATCH",
                body: { markAllRead: true },
            });
            router.refresh();
        } catch (error) {
            toast.error(translateApiError(tGlobal, error));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button
            onClick={handleClick}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-primary-600 bg-primary-50 rounded-xl hover:bg-primary-100 transition-colors disabled:opacity-50"
        >
            {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
                <CheckCheck className="w-4 h-4" />
            )}
            {label}
        </button>
    );
}
