"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConfirmDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description?: string;
    confirmLabel: string;
    cancelLabel: string;
    tone?: "default" | "danger";
    /** Resolves after the action completes; the dialog closes on success. */
    onConfirm: () => Promise<void> | void;
}

/**
 * Controlled confirm dialog for destructive/irreversible actions. Replaces
 * native `confirm()` with a styled modal that stays open on failure so the
 * caller can surface an error (e.g. via toast) without losing context.
 */
export function ConfirmDialog({
    open,
    onOpenChange,
    title,
    description,
    confirmLabel,
    cancelLabel,
    tone = "default",
    onConfirm,
}: ConfirmDialogProps) {
    const [loading, setLoading] = useState(false);

    if (!open) return null;

    const handleConfirm = async () => {
        if (loading) return;
        setLoading(true);
        try {
            await onConfirm();
            onOpenChange(false);
        } catch {
            // Caller surfaces the failure; keep the dialog open.
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/40"
                onClick={() => !loading && onOpenChange(false)}
                aria-hidden
            />
            <div className="relative w-full max-w-md rounded-2xl border border-waqf-border bg-white p-6 shadow-xl">
                <h3 className="text-base font-bold text-secondary-900">{title}</h3>
                {description && (
                    <p className="mt-2 text-sm text-secondary-600">{description}</p>
                )}
                <div className="mt-6 flex justify-end gap-2">
                    <button
                        onClick={() => onOpenChange(false)}
                        disabled={loading}
                        className="rounded-xl border border-secondary-200 px-4 py-2 text-sm font-medium text-secondary-700 hover:bg-secondary-50 transition-colors disabled:opacity-50"
                    >
                        {cancelLabel}
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={loading}
                        className={cn(
                            "flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-medium text-white transition-colors disabled:opacity-50",
                            tone === "danger" ? "bg-red-600 hover:bg-red-700" : "bg-primary-600 hover:bg-primary-700"
                        )}
                    >
                        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}
