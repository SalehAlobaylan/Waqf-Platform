"use client";

import { useState, useRef, useEffect, KeyboardEvent, ClipboardEvent } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { Loader2, Mail, User, ArrowLeft } from "lucide-react";
import { SiGithub, SiGooglechrome } from "@icons-pack/react-simple-icons";

type Mode = "form" | "link-sent" | "otp-entry";

const OTP_LENGTH = 6;

export function SignupForm() {
    const t = useTranslations("auth");
    const locale = useLocale();
    const router = useRouter();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [acceptTerms, setAcceptTerms] = useState(false);
    const [mode, setMode] = useState<Mode>("form");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
    const [verifying, setVerifying] = useState(false);

    const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        if (mode === "otp-entry" && otpRefs.current[0]) {
            otpRefs.current[0]?.focus();
        }
    }, [mode]);

    const handleSendLink = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!name.trim()) return;
        if (!acceptTerms) {
            setError(t("acceptTermsRequired"));
            return;
        }

        setLoading(true);
        try {
            const { error: sendError } = await authClient.signIn.magicLink({
                email,
                name,
                callbackURL: `/${locale}/onboarding`,
            });
            if (sendError) {
                setError(t("signupError"));
                return;
            }
            setMode("link-sent");
        } catch {
            setError(t("signupError"));
        } finally {
            setLoading(false);
        }
    };

    const handleSendOtp = async () => {
        setError("");
        setLoading(true);
        try {
            const { error: sendError } = await authClient.emailOtp.sendVerificationOtp({
                email,
                type: "sign-in",
            });
            if (sendError) {
                setError(t("signupError"));
                return;
            }
            setMode("otp-entry");
        } catch {
            setError(t("signupError"));
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (code: string) => {
        if (code.length !== OTP_LENGTH) return;
        setVerifying(true);
        setError("");
        try {
            const { error: verifyError } = await authClient.signIn.emailOtp({
                email,
                otp: code,
            });
            if (verifyError) {
                setError(t("signupError"));
                setOtp(Array(OTP_LENGTH).fill(""));
                otpRefs.current[0]?.focus();
                return;
            }
            router.push(`/${locale}/onboarding`);
            router.refresh();
        } catch {
            setError(t("signupError"));
        } finally {
            setVerifying(false);
        }
    };

    const handleOtpChange = (index: number, value: string) => {
        if (value && !/^\d$/.test(value)) return;
        const next = [...otp];
        next[index] = value;
        setOtp(next);

        if (value && index < OTP_LENGTH - 1) {
            otpRefs.current[index + 1]?.focus();
        }
        if (next.every((d) => d !== "")) {
            handleVerifyOtp(next.join(""));
        }
    };

    const handleOtpKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            otpRefs.current[index - 1]?.focus();
        }
    };

    const handleOtpPaste = (e: ClipboardEvent<HTMLInputElement>) => {
        const pasted = e.clipboardData
            .getData("text")
            .replace(/\D/g, "")
            .slice(0, OTP_LENGTH);
        if (pasted.length === OTP_LENGTH) {
            e.preventDefault();
            const next = pasted.split("");
            setOtp(next);
            handleVerifyOtp(pasted);
        }
    };

    const handleGitHub = async () => {
        await authClient.signIn.social({
            provider: "github",
            callbackURL: `/${locale}/onboarding`,
        });
    };

    const handleGoogle = async () => {
        await authClient.signIn.social({
            provider: "google",
            callbackURL: `/${locale}/onboarding`,
        });
    };

    const reset = () => {
        setMode("form");
        setOtp(Array(OTP_LENGTH).fill(""));
        setError("");
    };

    return (
        <div className="w-full">
            <div className="text-center mb-8">
                <div className="flex justify-center mb-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 text-white font-bold text-2xl shadow-lg">
                        و
                    </div>
                </div>
                <h1 className="text-2xl font-bold text-secondary-900 mb-2">
                    {t("createYourAccount")}
                </h1>
                <p className="text-secondary-600">{t("signupSubtitle")}</p>
            </div>

            {error && (
                <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                    {error}
                </div>
            )}

            {mode === "form" && (
                <>
                    <button
                        onClick={handleGitHub}
                        className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-secondary-900 text-white rounded-xl font-medium hover:bg-secondary-800 transition-all duration-200 mb-3 shadow-sm hover:shadow-md"
                    >
                        <SiGithub size={20} />
                        {t("signupWithGitHub")}
                    </button>

                    <button
                        onClick={handleGoogle}
                        className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white text-secondary-900 border border-secondary-200 rounded-xl font-medium hover:bg-secondary-50 transition-all duration-200 mb-6 shadow-sm hover:shadow-md"
                    >
                        <SiGooglechrome size={20} />
                        {t("signupWithGoogle")}
                    </button>

                    <div className="relative mb-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-secondary-200"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-white text-secondary-500">
                                {t("orContinueWith")}
                            </span>
                        </div>
                    </div>

                    <form onSubmit={handleSendLink} className="space-y-4">
                        <div>
                            <label
                                htmlFor="name"
                                className="block text-sm font-medium text-secondary-700 mb-2"
                            >
                                {t("fullName")}
                            </label>
                            <div className="relative">
                                <User
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400"
                                    size={18}
                                />
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

                        <div>
                            <label
                                htmlFor="email"
                                className="block text-sm font-medium text-secondary-700 mb-2"
                            >
                                {t("email")}
                            </label>
                            <div className="relative">
                                <Mail
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400"
                                    size={18}
                                />
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder={t("emailPlaceholder")}
                                    required
                                    dir="ltr"
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-secondary-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-secondary-50 focus:bg-white"
                                />
                            </div>
                        </div>

                        <div className="flex items-start gap-3 pt-1">
                            <input
                                id="terms"
                                type="checkbox"
                                checked={acceptTerms}
                                onChange={(e) => setAcceptTerms(e.target.checked)}
                                className="mt-1 h-4 w-4 rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                            />
                            <label
                                htmlFor="terms"
                                className="text-sm text-secondary-600"
                            >
                                {t("agreeToTerms")}{" "}
                                <Link
                                    href={`/${locale}/terms`}
                                    className="text-primary-600 hover:underline"
                                >
                                    {t("termsOfService")}
                                </Link>
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl font-medium hover:from-primary-700 hover:to-primary-800 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="animate-spin" size={18} />
                                    {t("sendingLink")}
                                </>
                            ) : (
                                t("sendSignInLink")
                            )}
                        </button>
                    </form>
                </>
            )}

            {mode === "link-sent" && (
                <div className="text-center">
                    <div className="flex justify-center mb-4">
                        <div className="h-14 w-14 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center">
                            <Mail size={28} />
                        </div>
                    </div>
                    <h2 className="text-lg font-bold text-secondary-900 mb-2">
                        {t("checkYourInbox")}
                    </h2>
                    <p className="text-secondary-600 text-sm mb-2">
                        {t("checkYourInboxSubtitle", { email })}
                    </p>
                    <p className="text-xs text-secondary-500 mb-6">
                        {t("magicLinkNotDelivered")}
                    </p>

                    <div className="space-y-2">
                        <button
                            onClick={handleSendOtp}
                            disabled={loading}
                            className="w-full py-2.5 text-sm font-medium text-primary-600 hover:bg-primary-50 rounded-lg transition-colors disabled:opacity-50"
                        >
                            {t("useCodeInstead")}
                        </button>
                        <button
                            onClick={reset}
                            className="w-full py-2.5 text-sm font-medium text-secondary-600 hover:bg-secondary-50 rounded-lg transition-colors"
                        >
                            {t("useDifferentEmail")}
                        </button>
                    </div>
                </div>
            )}

            {mode === "otp-entry" && (
                <div>
                    <button
                        onClick={() => setMode("link-sent")}
                        className="inline-flex items-center gap-1 text-sm text-secondary-600 hover:text-secondary-900 mb-4"
                    >
                        <ArrowLeft size={14} className="rtl:rotate-180" />
                        {t("useLinkInstead")}
                    </button>

                    <h2 className="text-lg font-bold text-secondary-900 mb-2">
                        {t("enterCode")}
                    </h2>
                    <p className="text-secondary-600 text-sm mb-6">
                        {t("checkYourInboxSubtitleOtp", { email })}
                    </p>

                    <div
                        className="flex gap-2 justify-center mb-6"
                        dir="ltr"
                        onPaste={handleOtpPaste}
                    >
                        {otp.map((digit, i) => (
                            <input
                                key={i}
                                ref={(el) => {
                                    otpRefs.current[i] = el;
                                }}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleOtpChange(i, e.target.value)}
                                onKeyDown={(e) => handleOtpKeyDown(i, e)}
                                disabled={verifying}
                                className="w-12 h-14 text-center text-2xl font-bold rounded-xl border border-secondary-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-secondary-50 focus:bg-white disabled:opacity-50"
                            />
                        ))}
                    </div>

                    {verifying && (
                        <div className="flex items-center justify-center gap-2 text-sm text-secondary-600 mb-2">
                            <Loader2 className="animate-spin" size={16} />
                            {t("verifying")}
                        </div>
                    )}

                    <div className="text-center">
                        <button
                            onClick={handleSendOtp}
                            disabled={loading}
                            className="text-sm text-primary-600 hover:text-primary-700 font-medium disabled:opacity-50"
                        >
                            {t("resendCode")}
                        </button>
                    </div>
                </div>
            )}

            <p className="text-center text-sm text-secondary-600 mt-6">
                {t("alreadyHaveAccount")}{" "}
                <Link
                    href={`/${locale}/login`}
                    className="text-primary-600 font-medium hover:text-primary-700"
                >
                    {t("login")}
                </Link>
            </p>
        </div>
    );
}
