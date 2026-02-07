"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { ChevronDown, User, LogOut, Settings, LayoutDashboard } from "lucide-react";
import { useState, useRef, useEffect } from "react";

export function UserMenu() {
    const { data: session } = useSession();
    const t = useTranslations("nav");
    const locale = useLocale();
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Close menu on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    if (!session?.user) {
        return (
            <div className="flex items-center gap-3">
                <Link
                    href={`/${locale}/login`}
                    className="px-4 py-2 text-sm font-medium text-secondary-700 hover:text-secondary-900 transition-colors"
                >
                    {t("login")}
                </Link>
                <Link
                    href={`/${locale}/signup`}
                    className="px-4 py-2 text-sm font-medium bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-sm"
                >
                    {t("signup")}
                </Link>
            </div>
        );
    }

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-secondary-100 transition-colors"
            >
                {/* Avatar */}
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-sm font-medium overflow-hidden">
                    {session.user.image ? (
                        <img src={session.user.image} alt="" className="w-full h-full object-cover" />
                    ) : (
                        session.user.name?.charAt(0).toUpperCase() || "U"
                    )}
                </div>
                <ChevronDown
                    className={`w-4 h-4 text-secondary-500 transition-transform ${isOpen ? "rotate-180" : ""}`}
                />
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute end-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-secondary-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    {/* User Info */}
                    <div className="px-4 py-3 border-b border-secondary-100">
                        <p className="text-sm font-medium text-secondary-900 truncate">
                            {session.user.name}
                        </p>
                        <p className="text-xs text-secondary-500 truncate">
                            {session.user.email}
                        </p>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                        <Link
                            href={`/${locale}/dashboard`}
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-3 px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-50 transition-colors"
                        >
                            <LayoutDashboard className="w-4 h-4" />
                            {t("dashboard")}
                        </Link>
                        <Link
                            href={`/${locale}/profile/${session.user.id}`}
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-3 px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-50 transition-colors"
                        >
                            <User className="w-4 h-4" />
                            {t("profile")}
                        </Link>
                        <Link
                            href={`/${locale}/settings/profile`}
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-3 px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-50 transition-colors"
                        >
                            <Settings className="w-4 h-4" />
                            Settings
                        </Link>
                    </div>

                    {/* Logout */}
                    <div className="border-t border-secondary-100 pt-2">
                        <button
                            onClick={() => signOut({ callbackUrl: `/${locale}` })}
                            className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                            {t("logout")}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
