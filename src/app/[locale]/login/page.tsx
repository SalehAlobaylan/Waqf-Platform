"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Github, Eye, EyeOff, Loader2, ArrowRight } from "lucide-react";

interface LoginPageProps {
    params: Promise<{ locale: string }>;
}

export default function LoginPage({ params }: LoginPageProps) {
    const [locale, setLocale] = useState("en");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    // Resolve locale
    useState(() => {
        params.then((p) => setLocale(p.locale));
    });

    const isAr = locale === "ar";

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            const result = await authClient.signIn.email({
                email,
                password,
            });

            if (result.error) {
                setError(isAr ? "بيانات الدخول غير صحيحة" : "Invalid email or password");
            } else {
                router.push(`/${locale}/explore`);
                router.refresh();
            }
        } catch {
            setError(isAr ? "حدث خطأ. حاول مرة أخرى." : "Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleGithubLogin = async () => {
        await authClient.signIn.social({
            provider: "github",
            callbackURL: `/${locale}/explore`,
        });
    };

    return (
        <div className="min-h-screen bg-waqf-bg flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <Link href={`/${locale}`} className="inline-flex items-center gap-2 mb-4">
                        <div className="w-10 h-10 text-primary-600">
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2L4 7v6.5c0 4.97 3.5 9.04 8 10.5 4.5-1.46 8-5.53 8-10.5V7l-8-5z" />
                            </svg>
                        </div>
                        <span className="text-2xl font-black text-secondary-900">
                            {isAr ? "وقف" : "Waqf"}
                        </span>
                    </Link>
                    <h1 className="text-2xl font-bold text-secondary-900 mb-2">
                        {isAr ? "مرحباً بعودتك" : "Welcome back"}
                    </h1>
                    <p className="text-secondary-500 text-sm">
                        {isAr ? "سجل دخولك لمواصلة المساهمة" : "Sign in to continue contributing"}
                    </p>
                </div>

                {/* Card */}
                <div className="bg-white rounded-2xl border border-waqf-border shadow-sm p-8">
                    {/* GitHub OAuth */}
                    <button
                        onClick={handleGithubLogin}
                        className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-secondary-900 hover:bg-secondary-800 text-white font-semibold rounded-xl transition-colors mb-6"
                    >
                        <Github className="w-5 h-5" />
                        {isAr ? "تسجيل الدخول بـ GitHub" : "Continue with GitHub"}
                    </button>

                    {/* Divider */}
                    <div className="relative mb-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-secondary-200"></div>
                        </div>
                        <div className="relative flex justify-center text-xs">
                            <span className="bg-white px-3 text-secondary-400 uppercase tracking-wider">
                                {isAr ? "أو" : "or"}
                            </span>
                        </div>
                    </div>

                    {/* Email Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-secondary-700 mb-1.5">
                                {isAr ? "البريد الإلكتروني" : "Email"}
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full px-4 py-3 bg-secondary-50 border border-secondary-200 rounded-xl text-secondary-900 placeholder:text-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-600/20 focus:border-primary-600 transition-all"
                                placeholder={isAr ? "أدخل بريدك الإلكتروني" : "you@example.com"}
                            />
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label className="block text-sm font-medium text-secondary-700">
                                    {isAr ? "كلمة المرور" : "Password"}
                                </label>
                                <Link
                                    href="#"
                                    className="text-xs font-medium text-primary-600 hover:text-primary-700"
                                >
                                    {isAr ? "نسيت كلمة المرور؟" : "Forgot password?"}
                                </Link>
                            </div>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="w-full px-4 py-3 bg-secondary-50 border border-secondary-200 rounded-xl text-secondary-900 placeholder:text-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-600/20 focus:border-primary-600 transition-all pr-12"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-400 hover:text-secondary-600"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-bold rounded-xl transition-colors shadow-md shadow-primary-600/20"
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    {isAr ? "تسجيل الدخول" : "Sign In"}
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Sign up link */}
                <p className="text-center text-sm text-secondary-500 mt-6">
                    {isAr ? "ليس لديك حساب؟" : "Don't have an account?"}{" "}
                    <Link
                        href={`/${locale}/signup`}
                        className="font-bold text-primary-600 hover:text-primary-700"
                    >
                        {isAr ? "أنشئ حساباً" : "Sign up"}
                    </Link>
                </p>
            </div>
        </div>
    );
}
