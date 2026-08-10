"use client";

import { CheckCircle2, XCircle, AlertTriangle, Info, X } from "lucide-react";
import { useToastStore } from "@/lib/toast";
import { cn } from "@/lib/utils";

const TOAST_META: Record<
    string,
    { icon: React.ReactNode; border: string; iconColor: string }
> = {
    success: {
        icon: <CheckCircle2 className="w-5 h-5" />,
        border: "border-green-200",
        iconColor: "text-green-600",
    },
    error: {
        icon: <XCircle className="w-5 h-5" />,
        border: "border-red-200",
        iconColor: "text-red-600",
    },
    warning: {
        icon: <AlertTriangle className="w-5 h-5" />,
        border: "border-amber-200",
        iconColor: "text-amber-600",
    },
    info: {
        icon: <Info className="w-5 h-5" />,
        border: "border-blue-200",
        iconColor: "text-blue-600",
    },
};

export function Toaster() {
    const toasts = useToastStore((state) => state.toasts);
    const dismiss = useToastStore((state) => state.dismiss);

    return (
        <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 w-full max-w-sm pointer-events-none">
            {toasts.map((item) => {
                const meta = TOAST_META[item.type] ?? TOAST_META.info;
                return (
                    <div
                        key={item.id}
                        className={cn(
                            "pointer-events-auto flex items-start gap-3 rounded-xl border bg-white p-4 shadow-lg",
                            meta.border
                        )}
                        role="status"
                    >
                        <span className={cn("shrink-0 mt-0.5", meta.iconColor)}>{meta.icon}</span>
                        <div className="flex-1 min-w-0">
                            {item.title && (
                                <p className="text-sm font-semibold text-secondary-900">{item.title}</p>
                            )}
                            <p className="text-sm text-secondary-700">{item.message}</p>
                        </div>
                        <button
                            onClick={() => dismiss(item.id)}
                            className="shrink-0 rounded-md p-1 text-secondary-400 hover:text-secondary-700 transition-colors"
                            aria-label="Dismiss"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                );
            })}
        </div>
    );
}
