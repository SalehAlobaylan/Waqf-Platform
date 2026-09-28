"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { UserMenu } from "./UserMenu";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { Logo } from "@/components/brand/Logo";

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
        <Link href={`/${locale}`} className="flex items-center">
            <Logo variant="horizontal" className="h-7 md:h-8" priority />
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
