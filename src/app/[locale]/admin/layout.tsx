import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import Link from "next/link";
import {
    LayoutDashboard,
    FolderKanban,
    Users,
    BarChart3,
    Shield,
    ChevronRight
} from "lucide-react";

type Props = {
    params: Promise<{ locale: string }>;
    children: React.ReactNode;
};

export default async function AdminLayout({ params, children }: Props) {
    const { locale } = await params;
    setRequestLocale(locale);

    const session = await auth();

    // Redirect if not logged in
    if (!session?.user?.id) {
        redirect(`/${locale}/login`);
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { role: true, name: true },
    });

    if (user?.role !== "ADMIN") {
        redirect(`/${locale}`);
    }

    const isAr = locale === "ar";

    const navItems = [
        {
            href: `/${locale}/admin`,
            icon: LayoutDashboard,
            label: isAr ? "لوحة التحكم" : "Dashboard",
        },
        {
            href: `/${locale}/admin/projects`,
            icon: FolderKanban,
            label: isAr ? "إدارة المشاريع" : "Projects",
        },
        {
            href: `/${locale}/admin/users`,
            icon: Users,
            label: isAr ? "إدارة المستخدمين" : "Users",
        },
        {
            href: `/${locale}/admin/analytics`,
            icon: BarChart3,
            label: isAr ? "الإحصائيات" : "Analytics",
        },
    ];

    return (
        <div className="min-h-screen bg-secondary-50">
            {/* Admin Header */}
            <header className="bg-white border-b border-secondary-200 sticky top-0 z-40">
                <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary-600 text-white flex items-center justify-center">
                            <Shield className="w-5 h-5" />
                        </div>
                        <div>
                            <h1 className="font-bold text-secondary-900">
                                {isAr ? "لوحة الإدارة" : "Admin Panel"}
                            </h1>
                            <p className="text-xs text-secondary-500">{user?.name}</p>
                        </div>
                    </div>

                    <Link
                        href={`/${locale}`}
                        className="text-sm text-secondary-600 hover:text-primary-600 flex items-center gap-1"
                    >
                        {isAr ? "العودة للموقع" : "Back to Site"}
                        <ChevronRight className="w-4 h-4" />
                    </Link>
                </div>
            </header>

            <div className="max-w-[1400px] mx-auto flex">
                {/* Sidebar */}
                <aside className="w-64 shrink-0 bg-white border-r border-secondary-200 min-h-[calc(100vh-64px)] sticky top-16 self-start">
                    <nav className="p-4 space-y-1">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-secondary-700 hover:bg-primary-50 hover:text-primary-700 transition-colors"
                                >
                                    <Icon className="w-5 h-5" />
                                    <span className="font-medium">{item.label}</span>
                                </Link>
                            );
                        })}
                    </nav>
                </aside>

                {/* Main Content */}
                <main className="flex-1 p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
