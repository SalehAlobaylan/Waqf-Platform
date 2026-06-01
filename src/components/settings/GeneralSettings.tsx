"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import { Shield, Bell, Globe, Eye, EyeOff, Loader2, CheckCircle, Lock } from "lucide-react";

interface GeneralSettingsProps {
    userEmail: string;
    currentLanguage: string;
}

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
    const [emailNotifs, setEmailNotifs] = useState(true);
    const [appAccepted, setAppAccepted] = useState(true);
    const [appRejected, setAppRejected] = useState(true);
    const [newApplications, setNewApplications] = useState(true);
    const [messages, setMessages] = useState(true);
    const handleSave = () => {};

    return (
        <section className="p-6">
            <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center">
                    <Bell className="w-4.5 h-4.5 text-amber-600" />
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
                    className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-xl hover:bg-primary-700 transition-colors"
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

// ─── SECURITY / PASSWORD ────────────────────────
function SecuritySection({ isRtl, userEmail }: { isRtl: boolean; userEmail: string }) {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setMessage("");

        if (newPassword.length < 8) {
            setError(isRtl ? "كلمة المرور يجب أن تكون 8 أحرف على الأقل" : "Password must be at least 8 characters");
            return;
        }
        if (newPassword !== confirmPassword) {
            setError(isRtl ? "كلمتا المرور غير متطابقتين" : "Passwords don't match");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch("/api/auth/change-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ currentPassword, newPassword }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || "Failed");
            }

            setMessage(isRtl ? "تم تغيير كلمة المرور بنجاح" : "Password changed successfully");
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (err) {
            const message = err instanceof Error
                ? err.message
                : (isRtl ? "فشل تغيير كلمة المرور" : "Failed to change password");
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="p-6">
            <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center">
                    <Shield className="w-4.5 h-4.5 text-red-600" />
                </div>
                <div>
                    <h2 className="font-bold text-secondary-900">
                        {isRtl ? "الأمان" : "Security"}
                    </h2>
                    <p className="text-xs text-secondary-500">
                        {isRtl ? "إدارة كلمة المرور والأمان" : "Manage your password and security"}
                    </p>
                </div>
            </div>

            <div className="mb-4 px-4 py-3 bg-secondary-50 rounded-xl">
                <p className="text-xs text-secondary-500">{isRtl ? "البريد الإلكتروني" : "Email"}</p>
                <p className="text-sm font-medium text-secondary-900">{userEmail}</p>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4">
                <PasswordField
                    label={isRtl ? "كلمة المرور الحالية" : "Current Password"}
                    value={currentPassword}
                    onChange={setCurrentPassword}
                    show={showCurrent}
                    onToggle={() => setShowCurrent(!showCurrent)}
                />
                <PasswordField
                    label={isRtl ? "كلمة المرور الجديدة" : "New Password"}
                    value={newPassword}
                    onChange={setNewPassword}
                    show={showNew}
                    onToggle={() => setShowNew(!showNew)}
                />
                <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-1.5">
                        {isRtl ? "تأكيد كلمة المرور" : "Confirm New Password"}
                    </label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400" />
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-secondary-200 rounded-xl text-sm focus:ring-1 focus:ring-primary-600 focus:border-primary-600"
                            required
                        />
                    </div>
                </div>

                {error && <p className="text-sm text-red-500">{error}</p>}
                {message && <p className="text-sm text-green-600 flex items-center gap-1"><CheckCircle className="w-4 h-4" />{message}</p>}

                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 bg-secondary-900 text-white text-sm font-medium rounded-xl hover:bg-secondary-800 transition-colors disabled:opacity-50"
                    >
                        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                        {isRtl ? "تغيير كلمة المرور" : "Change Password"}
                    </button>
                </div>
            </form>
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
                    <Globe className="w-4.5 h-4.5 text-blue-600" />
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

function PasswordField({ label, value, onChange, show, onToggle }: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    show: boolean;
    onToggle: () => void;
}) {
    return (
        <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1.5">{label}</label>
            <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400" />
                <input
                    type={show ? "text" : "password"}
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 border border-secondary-200 rounded-xl text-sm focus:ring-1 focus:ring-primary-600 focus:border-primary-600"
                    required
                />
                <button
                    type="button"
                    onClick={onToggle}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-400 hover:text-secondary-600"
                >
                    {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
            </div>
        </div>
    );
}
