import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
    Bell, MessageSquare, UserPlus,
    FileCheck, FileX, ArrowLeft, Inbox
} from "lucide-react";
import { MarkAllReadButton } from "@/components/notifications/MarkAllReadButton";

interface NotificationsPageProps {
    params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: NotificationsPageProps) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "metadata" });
    return {
        title: t("dashboardNotifications"),
    };
}

const typeIcons: Record<string, React.ElementType> = {
    NEW_APPLICATION: UserPlus,
    APPLICATION_ACCEPTED: FileCheck,
    APPLICATION_REJECTED: FileX,
    NEW_MESSAGE: MessageSquare,
    DEFAULT: Bell,
};

const typeStyles: Record<string, string> = {
    NEW_APPLICATION: "bg-blue-100 text-blue-600",
    APPLICATION_ACCEPTED: "bg-green-100 text-green-600",
    APPLICATION_REJECTED: "bg-red-100 text-red-500",
    NEW_MESSAGE: "bg-purple-100 text-purple-600",
    DEFAULT: "bg-secondary-100 text-secondary-500",
};

export default async function NotificationsPage({ params }: NotificationsPageProps) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "dashboard.notifications" });
    const tCommon = await getTranslations({ locale, namespace: "common" });
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
        redirect(`/${locale}/login`);
    }

    const isRtl = locale === "ar";

    const notifications = await prisma.notification.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
        take: 50,
    });

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <div className="min-h-screen bg-secondary-50">
            <div className="container max-w-3xl mx-auto px-4 py-8">
                <Link
                    href={`/${locale}/dashboard`}
                    className="inline-flex items-center gap-2 text-secondary-500 hover:text-secondary-700 mb-6 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
                    {tCommon("back")}
                </Link>

                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-secondary-900 flex items-center gap-3">
                            <Bell className="w-7 h-7 text-primary-600" />
                            {t("title")}
                        </h1>
                        {unreadCount > 0 && (
                            <p className="text-sm text-secondary-500 mt-1">
                                {t("unread", { count: unreadCount })}
                            </p>
                        )}
                    </div>
                    {unreadCount > 0 && (
                        <MarkAllReadButton label={t("markAllRead")} />
                    )}
                </div>

                {notifications.length > 0 ? (
                    <div className="bg-white rounded-2xl border border-secondary-100 shadow-sm overflow-hidden divide-y divide-secondary-50">
                        {notifications.map(notif => {
                            const Icon = typeIcons[notif.type] || typeIcons.DEFAULT;
                            const iconStyle = typeStyles[notif.type] || typeStyles.DEFAULT;

                            return (
                                <div
                                    key={notif.id}
                                    className={`flex gap-4 p-5 transition-colors ${!notif.read ? "bg-primary-50/20" : "hover:bg-secondary-50/50"}`}
                                >
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${iconStyle}`}>
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-sm ${!notif.read ? "font-semibold text-secondary-900" : "text-secondary-700"}`}>
                                            {notif.title}
                                        </p>
                                        <p className="text-xs text-secondary-500 mt-0.5 line-clamp-2">
                                            {notif.content}
                                        </p>
                                        <div className="flex items-center gap-3 mt-2">
                                            <span className="text-[10px] text-secondary-400">
                                                {new Date(notif.createdAt).toLocaleDateString(
                                                    isRtl ? "ar-SA" : "en-US",
                                                    { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }
                                                )}
                                            </span>
                                            {notif.link && (
                                                <Link
                                                    href={`/${locale}${notif.link}`}
                                                    className="text-[10px] text-primary-600 hover:underline font-medium"
                                                >
                                                    {t("view")}
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                    {!notif.read && (
                                        <div className="w-2.5 h-2.5 rounded-full bg-primary-500 shrink-0 mt-1.5" />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl border border-secondary-100 p-12 text-center">
                        <div className="w-16 h-16 mx-auto mb-4 bg-secondary-100 rounded-full flex items-center justify-center">
                            <Inbox className="w-8 h-8 text-secondary-400" />
                        </div>
                        <h3 className="text-lg font-bold text-secondary-900 mb-2">
                            {t("noNotifications")}
                        </h3>
                        <p className="text-secondary-500 max-w-md mx-auto">
                            {isRtl
                                ? "ستظهر هنا أي تحديثات على طلباتك ومشاريعك"
                                : "Updates about your applications and projects will appear here"}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
