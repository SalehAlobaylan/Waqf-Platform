import { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { User, Shield } from "lucide-react";
import Link from "next/link";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function SettingsLayout({
    children,
    params,
}: {
    children: ReactNode;
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;

    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session || !session.user) {
        redirect(`/${locale}/login`);
    }

    // Usually we would fetch translations via next-intl on server, 
    // but doing simple labels here for brevity.
    const navItems = [
        { href: `/${locale}/settings/profile`, label: locale === "ar" ? "الملف الشخصي" : "Profile", icon: User },
        // Add more settings pages in the future here
    ];

    return (
        <div className="min-h-screen bg-secondary-50 py-8">
            <div className="container max-w-5xl mx-auto px-4">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-secondary-900">
                        {locale === "ar" ? "الإعدادات" : "Settings"}
                    </h1>
                </div>

                <div className="flex flex-col md:flex-row gap-8">
                    {/* Sidebar */}
                    <aside className="w-full md:w-64 shrink-0">
                        <nav className="flex flex-col gap-1">
                            {navItems.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-secondary-600 hover:text-primary-600 hover:bg-primary-50 transition-colors bg-white font-medium shadow-sm border border-secondary-100"
                                >
                                    <item.icon size={18} />
                                    {item.label}
                                </Link>
                            ))}
                        </nav>
                    </aside>

                    {/* Content */}
                    <main className="flex-1">
                        <div className="bg-white rounded-2xl shadow-sm border border-secondary-100 overflow-hidden">
                            {children}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}
