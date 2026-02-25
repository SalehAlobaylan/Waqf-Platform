import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

interface AuthLayoutProps {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}

export default async function AuthLayout({ children, params }: AuthLayoutProps) {
    const session = await auth.api.getSession({ headers: await headers() });
    const { locale } = await params;

    // Redirect authenticated users to dashboard
    if (session) {
        redirect(`/${locale}/dashboard`);
    }

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-primary-50 via-white to-secondary-50">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-5 pointer-events-none" />

            {/* Main Content */}
            <main className="flex-1 flex items-center justify-center p-4 relative">
                <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-secondary-100 p-8">
                    {children}
                </div>
            </main>

            {/* Footer */}
            <footer className="py-4 text-center text-sm text-secondary-500">
                <p>© 2026 Waqf. Sadaqah Jariyah through Code.</p>
            </footer>
        </div>
    );
}
