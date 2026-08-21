"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { UserMenu } from "./UserMenu";
import { NotificationBell } from "@/components/notifications/NotificationBell";

export function Navbar() {
    const t = useTranslations("nav");
    const locale = useLocale();
    const pathname = usePathname();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const onScroll = () => setIsScrolled(window.scrollY > 8);
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    if (pathname.includes("/admin")) return null;

    const isActive = (match: string | null) =>
        match !== null && pathname.startsWith(`/${locale}${match}`);

    const links = [
        { href: `/${locale}/explore`, label: t("explore"), match: "/explore" },
        { href: `/${locale}/campaigns`, label: t("campaigns"), match: "/campaigns" },
        { href: `/${locale}#how-it-works`, label: t("howItWorks"), match: null },
        { href: `/${locale}#about`, label: t("about"), match: null },
    ];

    const logo = (
        <Link href={`/${locale}`} className="flex items-center gap-3">
            <div className="w-8 h-8 text-primary-600 bg-primary-600/10 rounded-lg flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2L4 7v6.5c0 4.97 3.5 9.04 8 10.5 4.5-1.46 8-5.53 8-10.5V7l-8-5zm0 2.18l6 3.75v5.57c0 4.13-2.88 7.68-6 8.82-3.12-1.14-6-4.69-6-8.82V7.93l6-3.75z" />
                </svg>
            </div>
            <div className="flex flex-col">
                <span className="text-secondary-900 text-xl font-bold leading-none tracking-[-0.015em]">
                    {locale === "ar" ? "وقف" : "Waqf"}
                </span>
            </div>
        </Link>
    );

    return (
        <header
            className={`sticky top-0 z-50 w-full border-b border-waqf-border bg-waqf-bg/95 backdrop-blur supports-[backdrop-filter]:bg-waqf-bg/60 transition-shadow duration-300 ${
                isScrolled ? "shadow-[0_4px_20px_-8px_rgba(8,37,32,0.15)]" : ""
            }`}
        >
            <nav className="px-4 md:px-10 py-3 flex items-center justify-between mx-auto max-w-[1280px]">
                {logo}

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-8 self-stretch">
                    {links.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`relative flex items-center text-sm font-medium transition-colors ${
                                isActive(link.match)
                                    ? "text-primary-700"
                                    : "text-secondary-600 hover:text-primary-700"
                            }`}
                        >
                            {link.label}
                            {isActive(link.match) && (
                                <span
                                    aria-hidden
                                    className="absolute inset-x-0 -bottom-3.5 h-0.5 bg-accent-500"
                                />
                            )}
                        </Link>
                    ))}
                </div>

                {/* Desktop Actions — auth-aware */}
                <div className="hidden md:flex items-center gap-3">
                    <LanguageSwitcher />
                    <NotificationBell />
                    <UserMenu />
                </div>

                {/* Mobile Menu Button */}
                <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="md:hidden p-2 text-secondary-900 hover:bg-secondary-100 rounded-lg transition-colors"
                    aria-label="Toggle menu"
                    aria-expanded={isMenuOpen}
                >
                    {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </nav>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden border-t border-waqf-border bg-white menu-in">
                    <nav className="flex flex-col p-4 space-y-4">
                        {links.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`text-base font-medium py-2 transition-colors ${
                                    isActive(link.match)
                                        ? "text-primary-700"
                                        : "text-secondary-900 hover:text-primary-600"
                                }`}
                                onClick={() => setIsMenuOpen(false)}
                            >
                                {link.label}
                            </Link>
                        ))}

                        <div className="pt-4 border-t border-waqf-border flex flex-col gap-3">
                            <div className="flex items-center justify-between">
                                <LanguageSwitcher />
                                <NotificationBell />
                            </div>
                            <UserMenu />
                        </div>
                    </nav>
                </div>
            )}
        </header>
    );
}
