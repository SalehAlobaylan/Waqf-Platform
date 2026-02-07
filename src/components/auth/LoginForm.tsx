"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { Eye, EyeOff, Github, Loader2, Mail } from "lucide-react";

export function LoginForm() {
    const t = useTranslations("auth");
    const locale = useLocale();
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const result = await signIn("credentials", {
                email,
                password,
                redirect: false,
            });

            if (result?.error) {
                setError(t("invalidCredentials"));
            } else {
                router.push(`/${locale}/dashboard`);
                router.refresh();
            }
        } catch {
            setError(t("loginError"));
        } finally {
            setLoading(false);
        }
    };

    const handleGitHubLogin = () => {
        signIn("github", { callbackUrl: `/${locale}/dashboard` });
    };

    return (
        <div className="w-full max-w-md mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
                <div className="flex justify-center mb-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 text-white font-bold text-2xl shadow-lg">
                        و
                    </div>
                </div>
                <h1 className="text-2xl font-bold text-secondary-900 mb-2">
                    {t("welcomeBack")}
                </h1>
                <p className="text-secondary-600">
                    {t("loginSubtitle")}
                </p>
            </div>

            {/* GitHub Button */}
            <button
                onClick={handleGitHubLogin}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-secondary-900 text-white rounded-xl font-medium hover:bg-secondary-800 transition-all duration-200 mb-6 shadow-sm hover:shadow-md"
            >
                <Github size={20} />
                {t("continueWithGitHub")}
            </button>

            {/* Divider */}
            <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-secondary-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-secondary-500">{t("orContinueWith")}</span>
                </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Error Message */}
                {error && (
                    <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                        {error}
                    </div>
                )}

                {/* Email */}
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-secondary-700 mb-2">
                        {t("email")}
                    </label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400" size={18} />
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="name@example.com"
                            required
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-secondary-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-secondary-50 focus:bg-white"
                        />
                    </div>
                </div>

                {/* Password */}
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label htmlFor="password" className="block text-sm font-medium text-secondary-700">
                            {t("password")}
                        </label>
                        <Link href={`/${locale}/forgot-password`} className="text-sm text-primary-600 hover:text-primary-700">
                            {t("forgotPassword")}
                        </Link>
                    </div>
                    <div className="relative">
                        <input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            className="w-full px-4 py-3 rounded-xl border border-secondary-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-secondary-50 focus:bg-white"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-400 hover:text-secondary-600"
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl font-medium hover:from-primary-700 hover:to-primary-800 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <>
                            <Loader2 className="animate-spin" size={18} />
                            {t("loggingIn")}
                        </>
                    ) : (
                        t("login")
                    )}
                </button>
            </form>

            {/* Footer */}
            <p className="text-center text-sm text-secondary-600 mt-6">
                {t("noAccount")}{" "}
                <Link href={`/${locale}/signup`} className="text-primary-600 font-medium hover:text-primary-700">
                    {t("createAccount")}
                </Link>
            </p>
        </div>
    );
}
