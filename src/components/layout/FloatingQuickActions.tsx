"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Plus, Search, FolderPlus, MessageSquare } from "lucide-react";

export function FloatingQuickActions() {
    const t = useTranslations("quickActions");
    const locale = useLocale();
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);

    if (pathname.includes("/admin")) return null;

    const actions = [
        {
            href: `/${locale}/projects/new`,
            icon: FolderPlus,
            label: t("createProject"),
        },
        {
            href: `/${locale}/explore`,
            icon: Search,
            label: t("explore"),
        },
        {
            href: `/${locale}/dashboard/messages`,
            icon: MessageSquare,
            label: t("messages"),
        },
    ];

    return (
        <div className="fixed bottom-6 end-6 z-50 flex flex-col items-end gap-3">
            {isOpen && (
                <div className="flex flex-col gap-2">
                    {actions.map((action, idx) => {
                        const Icon = action.icon;
                        return (
                            <Link
                                key={action.href}
                                href={action.href}
                                onClick={() => setIsOpen(false)}
                                className="flex items-center gap-2.5 bg-white text-secondary-900 px-4 py-2.5 rounded-xl shadow-lg border border-waqf-border hover:border-[#1f705d]/30 hover:shadow-xl transition-all duration-200 group"
                                style={{
                                    animationDelay: `${idx * 50}ms`,
                                }}
                            >
                                <Icon className="w-4 h-4 text-[#1f705d] group-hover:scale-110 transition-transform" />
                                <span className="text-sm font-medium whitespace-nowrap">
                                    {action.label}
                                </span>
                            </Link>
                        );
                    })}
                </div>
            )}

            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-12 h-12 rounded-full bg-[#1f705d] text-white flex items-center justify-center shadow-lg shadow-[#1f705d]/25 hover:bg-[#195c4c] hover:shadow-xl hover:shadow-[#1f705d]/30 transition-all duration-300"
                aria-label={t("toggle")}
            >
                <Plus
                    className={`w-5 h-5 transition-transform duration-300 ${isOpen ? "rotate-45" : ""}`}
                />
            </button>
        </div>
    );
}
