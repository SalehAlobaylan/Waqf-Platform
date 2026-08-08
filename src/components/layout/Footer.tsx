"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { Heart } from "lucide-react";

export function Footer() {
    const t = useTranslations("footer");
    const tNav = useTranslations("nav");
    const locale = useLocale();
    const pathname = usePathname();

    if (pathname.includes("/admin")) return null;

    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-white border-t border-waqf-border py-12 px-4">
            <div className="max-w-[1280px] mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
                    {/* Brand */}
                    <div className="col-span-1">
                        <Link href={`/${locale}`} className="flex items-center gap-2 mb-4">
                            <div className="w-6 h-6 text-primary-600 flex items-center justify-center">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 2L4 7v6.5c0 4.97 3.5 9.04 8 10.5 4.5-1.46 8-5.53 8-10.5V7l-8-5z" />
                                </svg>
                            </div>
                            <span className="text-secondary-900 text-lg font-bold">
                                {locale === "ar" ? "وقف" : "Waqf"}
                            </span>
                        </Link>
                        <p className="text-sm text-secondary-500 max-w-xs">
                            {locale === "ar"
                                ? "نبني التقنية ذات الأثر المستدام، سطر كود في كل مرة."
                                : "Building technology with lasting impact, one commit at a time."}
                        </p>
                    </div>

                    {/* Platform */}
                    <div>
                        <h4 className="font-bold text-secondary-900 mb-4">
                            {locale === "ar" ? "المنصة" : "Platform"}
                        </h4>
                        <ul className="space-y-2 text-sm text-secondary-500">
                            <li>
                                <Link
                                    href={`/${locale}/explore`}
                                    className="hover:text-primary-600 transition-colors"
                                >
                                    {tNav("explore")}
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href={`/${locale}#how-it-works`}
                                    className="hover:text-primary-600 transition-colors"
                                >
                                    {tNav("howItWorks")}
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Community */}
                    <div>
                        <h4 className="font-bold text-secondary-900 mb-4">
                            {t("community")}
                        </h4>
                        <ul className="space-y-2 text-sm text-secondary-500">
                            <li>
                                <a
                                    href="https://github.com"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:text-primary-600 transition-colors"
                                >
                                    GitHub
                                </a>
                            </li>
                            <li>
                                <a
                                    href="https://discord.com"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:text-primary-600 transition-colors"
                                >
                                    Discord
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h4 className="font-bold text-secondary-900 mb-4">{t("legal")}</h4>
                        <ul className="space-y-2 text-sm text-secondary-500">
                            <li>
                                <Link
                                    href={`/${locale}/privacy`}
                                    className="hover:text-primary-600 transition-colors"
                                >
                                    {t("privacy")}
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href={`/${locale}/terms`}
                                    className="hover:text-primary-600 transition-colors"
                                >
                                    {t("terms")}
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href={`/${locale}/contact`}
                                    className="hover:text-primary-600 transition-colors"
                                >
                                    {t("contact")}
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-secondary-100 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-secondary-500">
                        © {currentYear} {locale === "ar" ? "منصة وقف. جميع الحقوق محفوظة" : "Waqf Platform. All rights reserved"}.
                    </p>
                    <div className="flex items-center gap-2 text-sm text-secondary-400">
                        <span>{locale === "ar" ? "صُنع بـ" : "Made with"}</span>
                        <Heart className="w-4 h-4 text-red-500" fill="currentColor" />
                        <span>{locale === "ar" ? "لمجتمع المطورين" : "for the developer community"}</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
