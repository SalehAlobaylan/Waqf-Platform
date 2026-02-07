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

    return (
        <header className="sticky top-0 z-50 w-full border-b border-secondary-200 bg-white/80 backdrop-blur-md">
            <nav className="container mx-auto flex h-16 items-center justify-between px-4">
                {/* Logo */}
                <Link href={`/${locale}`} className="flex items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-600 text-white font-bold text-xl">
                        و
                    </div>
                    <span className="text-xl font-bold text-primary-700">
                        {locale === "ar" ? "وقف" : "Waqf"}
                    </span>
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-6">
                    <Link
                        href={`/${locale}/explore`}
                        className="text-secondary-600 hover:text-primary-600 font-medium transition-colors"
                    >
                        {t("explore")}
                    </Link>
                    <Link
                        href={`/${locale}#how-it-works`}
                        className="text-secondary-600 hover:text-primary-600 font-medium transition-colors"
                    >
                        {t("howItWorks")}
                    </Link>
                    <Link
                        href={`/${locale}#about`}
                        className="text-secondary-600 hover:text-primary-600 font-medium transition-colors"
                    >
                        {t("about")}
                    </Link>
                </div>

                {/* Desktop Actions */}
                <div className="hidden md:flex items-center gap-4">
                    <LanguageSwitcher />
                    <Link
                        href={`/${locale}/login`}
                        className="text-secondary-600 hover:text-primary-600 font-medium transition-colors"
                    >
                        {t("login")}
                    </Link>
                    <Link
                        href={`/${locale}/signup`}
                        className="px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
                    >
                        {t("signup")}
                    </Link>
                </div>

                {/* Mobile Menu Button */}
                <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="md:hidden p-2 text-secondary-600 hover:text-primary-600"
                    aria-label="Toggle menu"
                >
                    {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </nav>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden absolute top-16 left-0 right-0 bg-white border-b border-secondary-200 shadow-lg">
                    <div className="container mx-auto px-4 py-4 flex flex-col gap-4">
                        <Link
                            href={`/${locale}/explore`}
                            className="text-secondary-600 hover:text-primary-600 font-medium py-2"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            {t("explore")}
                        </Link>
                        <Link
                            href={`/${locale}#how-it-works`}
                            className="text-secondary-600 hover:text-primary-600 font-medium py-2"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            {t("howItWorks")}
                        </Link>
                        <Link
                            href={`/${locale}#about`}
                            className="text-secondary-600 hover:text-primary-600 font-medium py-2"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            {t("about")}
                        </Link>

                        <hr className="border-secondary-200" />

                        <div className="flex items-center justify-between">
                            <LanguageSwitcher />
                        </div>

                        <Link
                            href={`/${locale}/login`}
                            className="text-center py-2 text-primary-600 font-medium border border-primary-600 rounded-lg"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            {t("login")}
                        </Link>
                        <Link
                            href={`/${locale}/signup`}
                            className="text-center py-2 bg-primary-600 text-white font-medium rounded-lg"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            {t("signup")}
                        </Link>
                    </div>
                </div>
            )}
        </header>
    );
}
