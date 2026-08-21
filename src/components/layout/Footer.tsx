"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { Heart } from "lucide-react";

const STAR_LATTICE_LIGHT =
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='72' height='72' viewBox='0 0 72 72'%3E%3Cg fill='none' stroke='%23ffffff' stroke-opacity='0.55' stroke-width='1'%3E%3Crect x='18' y='18' width='36' height='36'/%3E%3Crect x='18' y='18' width='36' height='36' transform='rotate(45 36 36)'/%3E%3C/g%3E%3C/svg%3E\")";

export function Footer() {
    const t = useTranslations("footer");
    const tNav = useTranslations("nav");
    const locale = useLocale();
    const pathname = usePathname();

    if (pathname.includes("/admin")) return null;

    const currentYear = new Date().getFullYear();
    const isAr = locale === "ar";

    const columns = [
        {
            title: isAr ? "المنصة" : "Platform",
            links: [
                { label: tNav("explore"), href: `/${locale}/explore` },
                { label: tNav("campaigns"), href: `/${locale}/campaigns` },
                { label: tNav("howItWorks"), href: `/${locale}#how-it-works` },
                { label: tNav("about"), href: `/${locale}#about` },
            ],
        },
        {
            title: t("community"),
            links: [
                { label: "GitHub", href: "https://github.com", external: true },
                { label: "Discord", href: "https://discord.com", external: true },
            ],
        },
        {
            title: t("legal"),
            links: [
                { label: t("privacy"), href: `/${locale}/privacy` },
                { label: t("terms"), href: `/${locale}/terms` },
                { label: t("contact"), href: `/${locale}/contact` },
            ],
        },
    ];

    return (
        <footer className="relative bg-primary-950 text-white overflow-hidden">
            <div
                aria-hidden
                className="absolute inset-0 opacity-[0.04]"
                style={{ backgroundImage: STAR_LATTICE_LIGHT }}
            />
            <div className="relative max-w-[1280px] mx-auto px-4 pt-16 pb-8">
                <div className="grid grid-cols-2 md:grid-cols-[2fr_1fr_1fr_1fr] gap-x-6 gap-y-12 mb-16">
                    {/* Brand */}
                    <div className="col-span-2 md:col-span-1">
                        <Link href={`/${locale}`} className="flex items-center gap-3">
                            <div className="w-9 h-9 text-accent-400 bg-white/5 rounded-lg flex items-center justify-center">
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 2L4 7v6.5c0 4.97 3.5 9.04 8 10.5 4.5-1.46 8-5.53 8-10.5V7l-8-5zm0 2.18l6 3.75v5.57c0 4.13-2.88 7.68-6 8.82-3.12-1.14-6-4.69-6-8.82V7.93l6-3.75z" />
                                </svg>
                            </div>
                            <span
                                className="text-accent-400 font-arabic text-3xl leading-none"
                                lang="ar"
                            >
                                وقف
                            </span>
                        </Link>
                        <p className="mt-5 text-sm leading-relaxed text-primary-100/80 max-w-xs">
                            {isAr
                                ? "نبني التقنية ذات الأثر المستدام، سطر كود في كل مرة."
                                : "Building technology with lasting impact, one commit at a time."}
                        </p>
                    </div>

                    {columns.map((col) => (
                        <div key={col.title}>
                            <h4 className="text-sm font-semibold text-white mb-4">
                                {col.title}
                            </h4>
                            <ul className="space-y-3 text-sm text-primary-100/70">
                                {col.links.map((link) => (
                                    <li key={link.label}>
                                        {"external" in link && link.external ? (
                                            <a
                                                href={link.href}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="hover:text-white transition-colors"
                                            >
                                                {link.label}
                                            </a>
                                        ) : (
                                            <Link
                                                href={link.href}
                                                className="hover:text-white transition-colors"
                                            >
                                                {link.label}
                                            </Link>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Bottom bar */}
                <div className="pt-6 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-primary-200/60">
                    <p>
                        © {currentYear}{" "}
                        {isAr ? "منصة وقف. جميع الحقوق محفوظة" : "Waqf Platform. All rights reserved"}.
                    </p>
                    <p className="flex items-center gap-2">
                        <span>{isAr ? "صُنع بـ" : "Made with"}</span>
                        <Heart className="w-4 h-4 text-accent-400" fill="currentColor" />
                        <span>{isAr ? "لمجتمع المطورين" : "for the developer community"}</span>
                    </p>
                </div>
            </div>
        </footer>
    );
}
