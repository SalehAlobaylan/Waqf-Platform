"use client";

import Link from "next/link";
import Image from "next/image";
import { useLocale } from "next-intl";
import { MessageSquare, Clock } from "lucide-react";

interface ConversationPreview {
    applicationId: string;
    projectTitle: string;
    projectSlug: string;
    otherUser: {
        id: string;
        name: string;
        avatar: string | null;
    };
    lastMessage?: {
        content: string;
        createdAt: string;
        isOwn: boolean;
    };
    unreadCount: number;
}

interface MessageListProps {
    conversations: ConversationPreview[];
}

export function MessageList({ conversations }: MessageListProps) {
    const locale = useLocale();

    if (conversations.length === 0) {
        return (
            <div className="bg-white rounded-xl border border-secondary-100 p-12 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-secondary-100 rounded-full flex items-center justify-center">
                    <MessageSquare className="w-8 h-8 text-secondary-400" />
                </div>
                <h3 className="text-lg font-medium text-secondary-900 mb-2">
                    {locale === "ar" ? "لا توجد محادثات" : "No conversations yet"}
                </h3>
                <p className="text-secondary-500 max-w-md mx-auto">
                    {locale === "ar"
                        ? "ستظهر المحادثات هنا بعد التقديم على المشاريع"
                        : "Conversations will appear here after applying to projects"}
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            {conversations.map((conv) => (
                <Link
                    key={conv.applicationId}
                    href={`/${locale}/dashboard/applications/${conv.applicationId}`}
                    className="flex items-center gap-4 p-4 bg-white rounded-xl border border-secondary-100
                               hover:border-primary-200 hover:shadow-sm transition-all group"
                >
                    {/* Avatar */}
                    {conv.otherUser.avatar ? (
                        <Image
                            src={conv.otherUser.avatar}
                            alt={conv.otherUser.name}
                            width={48}
                            height={48}
                            className="rounded-full"
                        />
                    ) : (
                        <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-lg font-medium text-primary-700">
                            {conv.otherUser.name.charAt(0)}
                        </div>
                    )}

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                            <h4 className="font-medium text-secondary-900 truncate group-hover:text-primary-600 transition-colors">
                                {conv.otherUser.name}
                            </h4>
                            {conv.lastMessage && (
                                <span className="text-xs text-secondary-400 flex-shrink-0">
                                    {new Date(conv.lastMessage.createdAt).toLocaleDateString(
                                        locale === "ar" ? "ar-SA" : "en-US",
                                        { month: "short", day: "numeric" }
                                    )}
                                </span>
                            )}
                        </div>
                        <p className="text-sm text-secondary-500 truncate">{conv.projectTitle}</p>
                        {conv.lastMessage && (
                            <p className="text-sm text-secondary-400 truncate mt-1">
                                {conv.lastMessage.isOwn && (
                                    <span className="text-secondary-300">You: </span>
                                )}
                                {conv.lastMessage.content}
                            </p>
                        )}
                    </div>

                    {/* Unread badge */}
                    {conv.unreadCount > 0 && (
                        <div className="w-6 h-6 bg-primary-600 text-white text-xs font-medium rounded-full flex items-center justify-center">
                            {conv.unreadCount > 9 ? "9+" : conv.unreadCount}
                        </div>
                    )}
                </Link>
            ))}
        </div>
    );
}
