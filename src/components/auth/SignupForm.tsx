"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { Eye, EyeOff, Github, Loader2, Mail, User, Check } from "lucide-react";

export function SignupForm() {
    const t = useTranslations("auth");
    const locale = useLocale();
    const router = useRouter();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [acceptTerms, setAcceptTerms] = useState(false);

    // Password requirements
    const passwordRequirements = [
        { met: password.length >= 8, label: t("minChars") },
        { met: /[A-Z]/.test(password), label: t("uppercase") },
        { met: /[0-9]/.test(password), label: t("number") },
    ];

    const isPasswordValid = passwordRequirements.every((req) => req.met);
    const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!isPasswordValid) {
            setError(t("passwordRequirements"));
            return;
        }

        if (!passwordsMatch) {
            setError(t("passwordsMustMatch"));
            return;
        }

        if (!acceptTerms) {
            setError(t("acceptTermsRequired"));
            return;
        }

        setLoading(true);

        try {
            const res = await fetch("/api/auth/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password, name }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || t("signupError"));
                return;
            }

            // Auto sign in after signup
            const result = await signIn("credentials", {
                email,
                password,
                redirect: false,
            });

            if (result?.error) {
                router.push(`/${locale}/login`);
            } else {
                router.push(`/${locale}/onboarding`);
                router.refresh();
            }
        } catch {
            setError(t("signupError"));
        } finally {
            setLoading(false);
        }
    };

    const handleGitHubSignup = () => {
        signIn("github", { callbackUrl: `/${locale}/onboarding` });
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
                    {t("createYourAccount")}
                </h1>
                <p className="text-secondary-600">
                    {t("signupSubtitle")}
                </p>
            </div>

            {/* GitHub Button */}
            <button
                onClick={handleGitHubSignup}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-secondary-900 text-white rounded-xl font-medium hover:bg-secondary-800 transition-all duration-200 mb-6 shadow-sm hover:shadow-md"
            >
                <Github size={20} />
                {t("signupWithGitHub")}
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

                {/* Name */}
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-secondary-700 mb-2">
                        {t("fullName")}
                    </label>
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400" size={18} />
                        <input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder={t("fullNamePlaceholder")}
                            required
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-secondary-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-secondary-50 focus:bg-white"
                        />
                    </div>
                </div>

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
                    <label htmlFor="password" className="block text-sm font-medium text-secondary-700 mb-2">
                        {t("password")}
                    </label>
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

                    {/* Password Requirements */}
                    {password.length > 0 && (
                        <div className="mt-2 space-y-1">
                            {passwordRequirements.map((req, idx) => (
                                <div key={idx} className={`flex items-center gap-2 text-xs ${req.met ? 'text-green-600' : 'text-secondary-400'}`}>
                                    <Check size={14} className={req.met ? 'opacity-100' : 'opacity-30'} />
                                    {req.label}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Confirm Password */}
                <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-secondary-700 mb-2">
                        {t("confirmPassword")}
                    </label>
                    <input
                        id="confirmPassword"
                        type={showPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className={`w-full px-4 py-3 rounded-xl border ${confirmPassword.length > 0
                                ? passwordsMatch
                                    ? 'border-green-500 focus:ring-green-500'
                                    : 'border-red-300 focus:ring-red-500'
                                : 'border-secondary-200 focus:ring-primary-500'
                            } focus:ring-2 focus:border-primary-500 transition-all duration-200 bg-secondary-50 focus:bg-white`}
                    />
                </div>

                {/* Terms */}
                <div className="flex items-start gap-3">
                    <input
                        id="terms"
                        type="checkbox"
                        checked={acceptTerms}
                        onChange={(e) => setAcceptTerms(e.target.checked)}
                        className="mt-1 h-4 w-4 rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                    />
                    <label htmlFor="terms" className="text-sm text-secondary-600">
                        {t("agreeToTerms")}{" "}
                        <Link href={`/${locale}/terms`} className="text-primary-600 hover:underline">
                            {t("termsOfService")}
                        </Link>{" "}
                        {t("and")}{" "}
                        <Link href={`/${locale}/privacy`} className="text-primary-600 hover:underline">
                            {t("privacyPolicy")}
                        </Link>
                    </label>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={loading || !acceptTerms}
                    className="w-full py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl font-medium hover:from-primary-700 hover:to-primary-800 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <>
                            <Loader2 className="animate-spin" size={18} />
                            {t("creatingAccount")}
                        </>
                    ) : (
                        t("createAccount")
                    )}
                </button>
            </form>

            {/* Footer */}
            <p className="text-center text-sm text-secondary-600 mt-6">
                {t("alreadyHaveAccount")}{" "}
                <Link href={`/${locale}/login`} className="text-primary-600 font-medium hover:text-primary-700">
                    {t("login")}
                </Link>
            </p>
        </div>
    );
}
