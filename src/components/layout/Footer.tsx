"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { Heart } from "lucide-react";
import { Logo } from "@/components/brand/Logo";

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
                        <Link href={`/${locale}`} className="inline-flex">
                            <Logo variant="horizontal" tone="dark" className="h-8" />
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
