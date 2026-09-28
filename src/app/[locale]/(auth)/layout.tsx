import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import Link from "next/link";
import { Logo } from "@/components/brand/Logo";

const STAR_LATTICE_LIGHT =
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='72' height='72' viewBox='0 0 72 72'%3E%3Cg fill='none' stroke='%23ffffff' stroke-opacity='0.55' stroke-width='1'%3E%3Crect x='18' y='18' width='36' height='36'/%3E%3Crect x='18' y='18' width='36' height='36' transform='rotate(45 36 36)'/%3E%3C/g%3E%3C/svg%3E\")";

interface AuthLayoutProps {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}

export default async function AuthLayout({ children, params }: AuthLayoutProps) {
    const session = await auth.api.getSession({ headers: await headers() });
    const { locale } = await params;

    if (session) {
        redirect(`/${locale}/dashboard`);
    }

    const isAr = locale === "ar";

    return (
        <div className="min-h-screen grid grid-cols-1 lg:grid-cols-[1fr_1.2fr]">
            {/* Brand panel */}
            <aside className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-primary-950 text-white p-12 xl:p-16">
                <div
                    aria-hidden
                    className="absolute inset-0 opacity-[0.06]"
                    style={{ backgroundImage: STAR_LATTICE_LIGHT }}
                />
                <div
                    aria-hidden
                    className="absolute inset-0"
                    style={{
                        background:
                            "radial-gradient(ellipse 90% 70% at 50% 0%, transparent 40%, rgba(8,37,32,0.55) 100%)",
                    }}
                />
                <Link href={`/${locale}`} className="relative inline-flex w-fit">
                    <Logo
                        variant="horizontal"
                        tone="dark"
                        className="h-9 xl:h-10"
                        priority
                    />
                </Link>
                <div className="relative">
                    <p className="text-3xl xl:text-4xl font-bold tracking-tight leading-tight text-balance">
                        {isAr ? (
                            <>
                                تقنية ذات أثر{" "}
                                <span className="text-accent-400">يبقى</span>
                            </>
                        ) : (
                            <>
                                Tech for good —{" "}
                                <span className="text-accent-400">work that endures</span>
                            </>
                        )}
                    </p>
                    <p className="mt-4 text-primary-100 leading-relaxed max-w-md">
                        {isAr
                            ? "وقف يربط المطورين بالمشاريع التي تحتاج مساعدتك — مفتوحة أو مغلقة أو خاصة."
                            : "Waqf matches developers with projects that need help — open, closed, or private."}
                    </p>
                </div>
                <p className="relative text-sm text-primary-200/60">
                    © {new Date().getFullYear()} Waqf
                </p>
            </aside>

            {/* Form panel */}
            <main className="flex flex-col bg-waqf-bg">
                <div className="lg:hidden border-b border-waqf-border px-6 py-4">
                    <Link href={`/${locale}`} className="inline-flex w-fit">
                        <Logo variant="horizontal" className="h-7" priority />
                    </Link>
                </div>
                <div className="flex-1 flex items-center justify-center px-4 py-10 md:py-16">
                    <div className="w-full max-w-md">{children}</div>
                </div>
                <footer className="px-4 pb-6 text-center text-sm text-secondary-500">
                    <p>
                        © {new Date().getFullYear()} Waqf.{" "}
                        {isAr ? "تقنية ذات أثر دائم." : "Tech for lasting impact."}
                    </p>
                </footer>
            </main>
        </div>
    );
}
