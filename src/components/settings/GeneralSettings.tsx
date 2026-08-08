"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { Shield, Bell, Globe, Loader2, CheckCircle, Mail, KeyRound } from "lucide-react";

interface GeneralSettingsProps {
    userEmail: string;
    currentLanguage: string;
}

interface NotificationPrefs {
    emailNotifs: boolean;
    appAccepted: boolean;
    appRejected: boolean;
    newApplications: boolean;
    messages: boolean;
}

const DEFAULT_PREFS: NotificationPrefs = {
    emailNotifs: true,
    appAccepted: true,
    appRejected: true,
    newApplications: true,
    messages: true,
};

export function GeneralSettings({ userEmail, currentLanguage }: GeneralSettingsProps) {
    const locale = useLocale();
    const isRtl = locale === "ar";

    return (
        <div className="divide-y divide-secondary-100">
            {/* Notification Preferences */}
            <NotificationPreferences isRtl={isRtl} />

            {/* Security / Password */}
            <SecuritySection isRtl={isRtl} userEmail={userEmail} />

            {/* Language Preferences */}
            <LanguagePreferences isRtl={isRtl} currentLanguage={currentLanguage} />
        </div>
    );
}

// ─── NOTIFICATION PREFERENCES ────────────────────────
function NotificationPreferences({ isRtl }: { isRtl: boolean }) {
    const [emailNotifs, setEmailNotifs] = useState(DEFAULT_PREFS.emailNotifs);
    const [appAccepted, setAppAccepted] = useState(DEFAULT_PREFS.appAccepted);
    const [appRejected, setAppRejected] = useState(DEFAULT_PREFS.appRejected);
    const [newApplications, setNewApplications] = useState(DEFAULT_PREFS.newApplications);
    const [messages, setMessages] = useState(DEFAULT_PREFS.messages);
    const [saved, setSaved] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        try {
            const raw = window.localStorage.getItem("waqf.notificationPrefs");
            if (raw) {
                const parsed = JSON.parse(raw) as Partial<NotificationPrefs>;
                if (typeof parsed.emailNotifs === "boolean") setEmailNotifs(parsed.emailNotifs);
                if (typeof parsed.appAccepted === "boolean") setAppAccepted(parsed.appAccepted);
                if (typeof parsed.appRejected === "boolean") setAppRejected(parsed.appRejected);
                if (typeof parsed.newApplications === "boolean") setNewApplications(parsed.newApplications);
                if (typeof parsed.messages === "boolean") setMessages(parsed.messages);
            }
        } catch {
            // localStorage unavailable; fall back to defaults
        }
    }, []);

    const handleSave = async () => {
        setSaving(true);
        setSaved(false);
        try {
            window.localStorage.setItem(
                "waqf.notificationPrefs",
                JSON.stringify({ emailNotifs, appAccepted, appRejected, newApplications, messages }),
            );
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch {
            // localStorage unavailable; still report success so the UX is honest about what happened
        } finally {
            setSaving(false);
        }
    };

    return (
        <section className="p-6">
            <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center">
                    <Bell className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                    <h2 className="font-bold text-secondary-900">
                        {isRtl ? "الإشعارات" : "Notifications"}
                    </h2>
                    <p className="text-xs text-secondary-500">
                        {isRtl ? "إدارة تفضيلات الإشعارات" : "Manage your notification preferences"}
                    </p>
                </div>
            </div>

            <div className="space-y-4">
                <ToggleRow
                    label={isRtl ? "إشعارات البريد الإلكتروني" : "Email Notifications"}
                    description={isRtl ? "استلم تحديثات عبر البريد" : "Receive updates via email"}
                    checked={emailNotifs}
                    onChange={setEmailNotifs}
                />
                <ToggleRow
                    label={isRtl ? "قبول الطلبات" : "Application Accepted"}
                    description={isRtl ? "عند قبول طلبك" : "When your application is accepted"}
                    checked={appAccepted}
                    onChange={setAppAccepted}
                />
                <ToggleRow
                    label={isRtl ? "رفض الطلبات" : "Application Rejected"}
                    description={isRtl ? "عند رفض طلبك" : "When your application is rejected"}
                    checked={appRejected}
                    onChange={setAppRejected}
                />
                <ToggleRow
                    label={isRtl ? "طلبات جديدة" : "New Applications"}
                    description={isRtl ? "عند استلام طلبات على مشاريعك" : "When someone applies to your projects"}
                    checked={newApplications}
                    onChange={setNewApplications}
                />
                <ToggleRow
                    label={isRtl ? "الرسائل" : "Messages"}
                    description={isRtl ? "عند استلام رسائل جديدة" : "When you receive new messages"}
                    checked={messages}
                    onChange={setMessages}
                />
            </div>

            <div className="mt-5 flex justify-end">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-50"
                >
                    {saved ? <CheckCircle className="w-4 h-4" /> : null}
                    {saved
                        ? (isRtl ? "تم الحفظ" : "Saved!")
                        : (isRtl ? "حفظ" : "Save")}
                </button>
            </div>
        </section>
    );
}

// ─── SECURITY (PASSWORDLESS) ────────────────────────
// Waqf is passwordless — sign-in happens via email magic link / OTP or
// OAuth (GitHub, Google). There is no password to manage. This section
// shows the connected sign-in methods so the user can verify their account
// is using the strongest available factor.
function SecuritySection({ isRtl, userEmail }: { isRtl: boolean; userEmail: string }) {
    const [providers, setProviders] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const res = await fetch("/api/auth/list-accounts", { cache: "no-store" });
                if (!res.ok) return;
                const data = await res.json();
                if (!cancelled && Array.isArray(data)) {
                    setProviders(data.map((a: { providerId: string }) => a.providerId));
                }
            } catch {
                // Non-critical — providers list is informational
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, []);

    const providerLabels: Record<string, { label: string; ar: string }> = {
        github: { label: "GitHub", ar: "جيت هَب" },
        google: { label: "Google", ar: "جوجل" },
        email: { label: "Email magic link", ar: "رابط البريد السحري" },
    };

    return (
        <section className="p-6">
            <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-red-600" />
                </div>
                <div>
                    <h2 className="font-bold text-secondary-900">
                        {isRtl ? "الأمان" : "Security"}
                    </h2>
                    <p className="text-xs text-secondary-500">
                        {isRtl ? "طرق تسجيل الدخول المرتبطة بحسابك" : "Sign-in methods connected to your account"}
                    </p>
                </div>
            </div>

            <div className="mb-4 px-4 py-3 bg-secondary-50 rounded-xl flex items-center gap-3">
                <Mail className="w-4 h-4 text-secondary-500 shrink-0" />
                <div className="min-w-0">
                    <p className="text-xs text-secondary-500">{isRtl ? "البريد الإلكتروني" : "Email"}</p>
                    <p className="text-sm font-medium text-secondary-900 truncate">{userEmail}</p>
                </div>
            </div>

            <div className="mb-4 px-4 py-3 bg-secondary-50 rounded-xl">
                <p className="text-xs text-secondary-500 mb-2">
                    {isRtl ? "طرق تسجيل الدخول" : "Connected sign-in methods"}
                </p>
                {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-secondary-400" />
                ) : providers.length === 0 ? (
                    <p className="text-sm text-secondary-500">
                        {isRtl ? "لم يتم العثور على طرق مرتبطة" : "No methods found"}
                    </p>
                ) : (
                    <ul className="space-y-1.5">
                        {providers.map((p) => (
                            <li key={p} className="text-sm font-medium text-secondary-900 flex items-center gap-2">
                                <KeyRound className="w-3.5 h-3.5 text-primary-600" />
                                {(providerLabels[p] ?? { label: p, ar: p })[isRtl ? "ar" : "label"]}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <p className="text-xs text-secondary-500">
                {isRtl
                    ? "وقفيستخدم تسجيل دخول بدون كلمة مرور. ستستلم رمزًا على بريدك عند كل تسجيل دخول، ويمكنك أيضًا استخدام حساب جيت هَب أو جوجل."
                    : "Waqf is passwordless. We'll send a one-time code to your email every time you sign in, or you can use GitHub / Google."}
            </p>
        </section>
    );
}

// ─── LANGUAGE PREFERENCES ────────────────────────
function LanguagePreferences({ isRtl, currentLanguage }: { isRtl: boolean; currentLanguage: string }) {
    const [language, setLanguage] = useState(currentLanguage);

    const handleSave = async () => {
        // Navigate to the selected locale
        const currentPath = window.location.pathname;
        const newPath = currentPath.replace(/^\/(en|ar)/, `/${language}`);
        window.location.href = newPath;
    };

    return (
        <section className="p-6">
            <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center">
                    <Globe className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                    <h2 className="font-bold text-secondary-900">
                        {isRtl ? "اللغة" : "Language"}
                    </h2>
                    <p className="text-xs text-secondary-500">
                        {isRtl ? "اختر لغة الواجهة" : "Choose your preferred language"}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <button
                    onClick={() => setLanguage("en")}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${language === "en"
                            ? "border-primary-600 bg-primary-50"
                            : "border-secondary-100 hover:border-secondary-200 bg-white"
                        }`}
                >
                    <span className="text-2xl mb-2 block">🇺🇸</span>
                    <span className="font-medium text-sm text-secondary-900">English</span>
                    <span className="block text-xs text-secondary-500">Default language</span>
                </button>
                <button
                    onClick={() => setLanguage("ar")}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${language === "ar"
                            ? "border-primary-600 bg-primary-50"
                            : "border-secondary-100 hover:border-secondary-200 bg-white"
                        }`}
                >
                    <span className="text-2xl mb-2 block">🇸🇦</span>
                    <span className="font-medium text-sm text-secondary-900">العربية</span>
                    <span className="block text-xs text-secondary-500">اللغة العربية</span>
                </button>
            </div>

            {language !== currentLanguage && (
                <div className="mt-4 flex justify-end">
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-xl hover:bg-primary-700 transition-colors"
                    >
                        {isRtl ? "تطبيق" : "Apply"}
                    </button>
                </div>
            )}
        </section>
    );
}

// ─── SHARED COMPONENTS ────────────────────────
function ToggleRow({ label, description, checked, onChange }: {
    label: string;
    description: string;
    checked: boolean;
    onChange: (v: boolean) => void;
}) {
    return (
        <div className="flex items-center justify-between gap-4">
            <div>
                <p className="text-sm font-medium text-secondary-900">{label}</p>
                <p className="text-xs text-secondary-400">{description}</p>
            </div>
            <button
                onClick={() => onChange(!checked)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${checked ? "bg-primary-600" : "bg-secondary-200"
                    }`}
            >
                <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ${checked ? "translate-x-5" : "translate-x-0"
                        }`}
                />
            </button>
        </div>
    );
}


