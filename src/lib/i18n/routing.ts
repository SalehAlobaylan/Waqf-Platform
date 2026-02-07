import { defineRouting } from "next-intl/routing";

export const locales = ["ar", "en"] as const;
export type Locale = (typeof locales)[number];

export const routing = defineRouting({
  // Supported locales
  locales,
  // Arabic as default (Arabic-first platform)
  defaultLocale: "ar",
  // Don't show locale prefix for default locale
  localePrefix: "always",
});
