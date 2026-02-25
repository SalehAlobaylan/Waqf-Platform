"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { authClient } from "@/lib/auth-client";
import { useLocale } from "next-intl";
import Link from "next/link";
import {
    Bell,
    Check,
    CheckCheck,
    MessageSquare,
    UserPlus,
    FileCheck,
    FileX,
    X
} from "lucide-react";

interface Notification {
    id: string;
    type: string;
    title: string;
    content: string;
    link: string | null;
    read: boolean;
    createdAt: string;
}

const notificationIcons: Record<string, React.ElementType> = {
    NEW_APPLICATION: UserPlus,
    APPLICATION_ACCEPTED: FileCheck,
    APPLICATION_REJECTED: FileX,
    NEW_MESSAGE: MessageSquare,
    DEFAULT: Bell,
};

export function NotificationBell() {
    const { data: session } = authClient.useSession();
    const locale = useLocale();
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Fetch notifications
    const fetchNotifications = useCallback(async () => {
        if (!session?.user) return;

        try {
            setIsLoading(true);
            const response = await fetch("/api/notifications?limit=10");
            const data = await response.json();

            if (response.ok) {
                setNotifications(data.notifications || []);
                setUnreadCount(data.unreadCount || 0);
            }
        } catch (error) {
            console.error("Failed to fetch notifications:", error);
        } finally {
            setIsLoading(false);
        }
    }, [session?.user]);

    // Fetch on mount and periodically
    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, [fetchNotifications]);

    // Close dropdown on outside click
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Mark all as read
    const markAllRead = async () => {
        try {
            await fetch("/api/notifications", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ markAllRead: true }),
            });
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error("Failed to mark all as read:", error);
        }
    };

    // Mark single as read
    const markAsRead = async (notificationId: string) => {
        try {
            await fetch("/api/notifications", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ notificationIds: [notificationId] }),
            });
            setNotifications(prev =>
                prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error("Failed to mark as read:", error);
        }
    };

    if (!session?.user) return null;

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-lg hover:bg-secondary-100 transition-colors"
                aria-label="Notifications"
            >
                <Bell className="w-5 h-5 text-secondary-600" />
                {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-secondary-100 overflow-hidden z-50">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-secondary-100 bg-secondary-50">
                        <h3 className="font-semibold text-secondary-900">
                            {locale === "ar" ? "الإشعارات" : "Notifications"}
                        </h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllRead}
                                className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
                            >
                                <CheckCheck className="w-3.5 h-3.5" />
                                {locale === "ar" ? "قراءة الكل" : "Mark all read"}
                            </button>
                        )}
                    </div>

                    {/* Notifications List */}
                    <div className="max-h-80 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="py-8 text-center">
                                <Bell className="w-8 h-8 text-secondary-300 mx-auto mb-2" />
                                <p className="text-sm text-secondary-500">
                                    {locale === "ar" ? "لا توجد إشعارات" : "No notifications yet"}
                                </p>
                            </div>
                        ) : (
                            notifications.map((notification) => {
                                const Icon = notificationIcons[notification.type] || notificationIcons.DEFAULT;
                                const isUnread = !notification.read;

                                return (
                                    <div
                                        key={notification.id}
                                        className={`flex gap-3 p-4 border-b border-secondary-50 last:border-0 hover:bg-secondary-50 transition-colors ${isUnread ? "bg-primary-50/30" : ""
                                            }`}
                                    >
                                        <div className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center ${isUnread ? "bg-primary-100 text-primary-600" : "bg-secondary-100 text-secondary-500"
                                            }`}>
                                            <Icon className="w-4 h-4" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm leading-tight ${isUnread ? "font-medium text-secondary-900" : "text-secondary-700"}`}>
                                                {notification.title}
                                            </p>
                                            <p className="text-xs text-secondary-500 mt-0.5 line-clamp-2">
                                                {notification.content}
                                            </p>
                                            <div className="flex items-center gap-2 mt-1.5">
                                                <span className="text-[10px] text-secondary-400">
                                                    {new Date(notification.createdAt).toLocaleDateString(
                                                        locale === "ar" ? "ar-SA" : "en-US",
                                                        { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }
                                                    )}
                                                </span>
                                                {notification.link && (
                                                    <Link
                                                        href={`/${locale}${notification.link}`}
                                                        onClick={() => {
                                                            if (isUnread) markAsRead(notification.id);
                                                            setIsOpen(false);
                                                        }}
                                                        className="text-[10px] text-primary-600 hover:underline font-medium"
                                                    >
                                                        {locale === "ar" ? "عرض" : "View"}
                                                    </Link>
                                                )}
                                            </div>
                                        </div>
                                        {isUnread && (
                                            <button
                                                onClick={() => markAsRead(notification.id)}
                                                className="flex-shrink-0 p-1 hover:bg-secondary-100 rounded"
                                                title="Mark as read"
                                            >
                                                <Check className="w-3.5 h-3.5 text-secondary-400" />
                                            </button>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 0 && (
                        <div className="px-4 py-2 border-t border-secondary-100 bg-secondary-50 text-center">
                            <Link
                                href={`/${locale}/dashboard/notifications`}
                                onClick={() => setIsOpen(false)}
                                className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                            >
                                {locale === "ar" ? "عرض جميع الإشعارات" : "View all notifications"}
                            </Link>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
