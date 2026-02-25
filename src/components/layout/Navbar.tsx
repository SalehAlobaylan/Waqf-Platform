"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { LanguageSwitcher } from "./LanguageSwitcher";

export function Navbar() {
    const t = useTranslations("nav");
    const locale = useLocale();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

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
                <span className="text-[10px] text-primary-600 font-bold uppercase tracking-widest leading-none mt-0.5">
                    {locale === "ar" ? "مفتوح المصدر" : "Open Source"}
                </span>
            </div>
        </Link>
    );

    return (
        <header className="sticky top-0 z-50 w-full border-b border-waqf-border bg-waqf-bg/95 backdrop-blur supports-[backdrop-filter]:bg-waqf-bg/60">
            <nav className="px-4 md:px-10 py-3 flex items-center justify-between mx-auto max-w-[1280px]">
                {logo}

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-8">
                    <Link
                        href={`/${locale}/explore`}
                        className="text-secondary-900 hover:text-primary-600 transition-colors text-sm font-medium"
                    >
                        {t("explore")}
                    </Link>
                    <Link
                        href={`/${locale}#how-it-works`}
                        className="text-secondary-900 hover:text-primary-600 transition-colors text-sm font-medium"
                    >
                        {t("howItWorks")}
                    </Link>
                    <Link
                        href={`/${locale}#about`}
                        className="text-secondary-900 hover:text-primary-600 transition-colors text-sm font-medium"
                    >
                        {t("about")}
                    </Link>
                </div>

                {/* Desktop Actions */}
                <div className="hidden md:flex items-center gap-3">
                    <LanguageSwitcher />
                    <div className="w-px h-6 bg-secondary-200"></div>
                    <Link
                        href={`/${locale}/login`}
                        className="flex items-center justify-center rounded-lg h-9 px-4 text-secondary-900 hover:bg-secondary-50 text-sm font-bold transition-colors"
                    >
                        {t("login")}
                    </Link>
                    <Link
                        href={`/${locale}/signup`}
                        className="flex items-center justify-center rounded-lg h-9 px-4 bg-primary-600 hover:bg-primary-700 transition-colors text-white text-sm font-bold shadow-md shadow-primary-600/20"
                    >
                        {t("signup")}
                    </Link>
                </div>

                {/* Mobile Menu Button */}
                <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="md:hidden p-2 text-secondary-900 hover:bg-secondary-100 rounded-lg"
                    aria-label="Toggle menu"
                >
                    {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </nav>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden border-t border-waqf-border bg-white">
                    <nav className="flex flex-col p-4 space-y-4">
                        <Link
                            href={`/${locale}/explore`}
                            className="text-secondary-900 hover:text-primary-600 transition-colors text-base font-medium py-2"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            {t("explore")}
                        </Link>
                        <Link
                            href={`/${locale}#how-it-works`}
                            className="text-secondary-900 hover:text-primary-600 transition-colors text-base font-medium py-2"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            {t("howItWorks")}
                        </Link>
                        <Link
                            href={`/${locale}#about`}
                            className="text-secondary-900 hover:text-primary-600 transition-colors text-base font-medium py-2"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            {t("about")}
                        </Link>

                        <div className="pt-4 border-t border-secondary-100 flex flex-col gap-3">
                            <div className="flex items-center justify-between">
                                <LanguageSwitcher />
                            </div>
                            <Link
                                href={`/${locale}/login`}
                                className="w-full text-center rounded-lg h-10 flex items-center justify-center px-4 text-secondary-900 bg-secondary-100 hover:bg-secondary-200 text-sm font-bold transition-colors"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                {t("login")}
                            </Link>
                            <Link
                                href={`/${locale}/signup`}
                                className="w-full text-center rounded-lg h-10 flex items-center justify-center px-4 bg-primary-600 hover:bg-primary-700 transition-colors text-white text-sm font-bold"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                {t("signup")}
                            </Link>
                        </div>
                    </nav>
                </div>
            )}
        </header>
    );
}
