import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing, type Locale } from "@/lib/i18n/routing";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { FloatingQuickActions } from "@/components/layout/FloatingQuickActions";
import "@/app/globals.css";

export const metadata: Metadata = {
    title: {
        default: "Waqf - وقف",
        template: "%s | Waqf",
    },
    description:
        "Waqf is a contribution platform for developers. Match your skills with projects that need help — open, closed, or private.",
    keywords: [
        "waqf",
        "contribution platform",
        "developers",
        "open source",
        "tech for good",
        "volunteering",
        "project collaboration",
    ],
};

export function generateStaticParams() {
    return routing.locales.map((locale) => ({ locale }));
}

type Props = {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
};

export default async function LocaleLayout({ children, params }: Props) {
    const { locale } = await params;

    // Validate that the incoming `locale` is valid
    if (!routing.locales.includes(locale as Locale)) {
        notFound();
    }

    // Enable static rendering
    setRequestLocale(locale);

    // Get messages for the client provider
    const messages = await getMessages();

    // Determine text direction based on locale
    const dir = locale === "ar" ? "rtl" : "ltr";
    const lang = locale;

    return (
        <html lang={lang} dir={dir} suppressHydrationWarning>
            <head>
                {/* Google Fonts: Inter + Noto Sans Arabic */}
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link
                    rel="preconnect"
                    href="https://fonts.gstatic.com"
                    crossOrigin="anonymous"
                />
                <link
                    href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Noto+Sans+Arabic:wght@400;500;600;700&display=swap"
                    rel="stylesheet"
                />
            </head>
            <body className="min-h-screen antialiased flex flex-col">
                <AuthProvider>
                    <NextIntlClientProvider messages={messages}>
                        <div className="flex flex-col min-h-screen">
                            <Navbar />
                            <main className="flex-1">
                                {children}
                            </main>
                            <Footer />
                            <FloatingQuickActions />
                        </div>
                    </NextIntlClientProvider>
                </AuthProvider>
            </body>
        </html>
    );
}

