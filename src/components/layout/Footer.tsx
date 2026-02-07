import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";

export function Footer() {
    const t = useTranslations("footer");
    const tNav = useTranslations("nav");
    const locale = useLocale();

    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-secondary-900 text-secondary-300">
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div className="col-span-1 md:col-span-1">
                        <Link href={`/${locale}`} className="flex items-center gap-2 mb-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-600 text-white font-bold text-xl">
                                و
                            </div>
                            <span className="text-xl font-bold text-white">
                                {locale === "ar" ? "وقف" : "Waqf"}
                            </span>
                        </Link>
                        <p className="text-sm text-secondary-400 max-w-xs">
                            {locale === "ar"
                                ? "منصة تربط المطورين المسلمين بمشاريع مفتوحة المصدر لخدمة الأمة"
                                : "A platform connecting Muslim developers with open-source projects to serve the Ummah"}
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-white font-semibold mb-4">
                            {t("quickLinks")}
                        </h3>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link
                                    href={`/${locale}/explore`}
                                    className="hover:text-primary-400 transition-colors"
                                >
                                    {tNav("explore")}
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href={`/${locale}#how-it-works`}
                                    className="hover:text-primary-400 transition-colors"
                                >
                                    {tNav("howItWorks")}
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href={`/${locale}#about`}
                                    className="hover:text-primary-400 transition-colors"
                                >
                                    {tNav("about")}
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Community */}
                    <div>
                        <h3 className="text-white font-semibold mb-4">{t("community")}</h3>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <a
                                    href="https://github.com"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:text-primary-400 transition-colors"
                                >
                                    GitHub
                                </a>
                            </li>
                            <li>
                                <a
                                    href="https://discord.com"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:text-primary-400 transition-colors"
                                >
                                    Discord
                                </a>
                            </li>
                            <li>
                                <a
                                    href="https://twitter.com"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:text-primary-400 transition-colors"
                                >
                                    Twitter / X
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h3 className="text-white font-semibold mb-4">{t("legal")}</h3>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link
                                    href={`/${locale}/privacy`}
                                    className="hover:text-primary-400 transition-colors"
                                >
                                    {t("privacy")}
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href={`/${locale}/terms`}
                                    className="hover:text-primary-400 transition-colors"
                                >
                                    {t("terms")}
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href={`/${locale}/contact`}
                                    className="hover:text-primary-400 transition-colors"
                                >
                                    {t("contact")}
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Footer Bottom */}
                <div className="mt-12 pt-8 border-t border-secondary-700 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-secondary-400">
                        © {currentYear} Waqf. {locale === "ar" ? "جميع الحقوق محفوظة" : "All rights reserved"}.
                    </p>
                    <p className="text-sm text-primary-400 font-medium">
                        {t("madeWith")}
                    </p>
                </div>
            </div>
        </footer>
    );
}
