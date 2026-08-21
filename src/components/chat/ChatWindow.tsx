"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { authClient } from "@/lib/auth-client";
import { useTranslations } from "next-intl";
import { Send, Loader2, ArrowDown } from "lucide-react";
import { MessageBubble } from "./MessageBubble";
import { apiFetch } from "@/lib/api/client";
import { toast } from "@/lib/toast";
import { translateApiError } from "@/lib/i18n/client-errors";
import { getPusherClient, getApplicationChannel, PUSHER_EVENTS } from "@/lib/pusher";

interface Message {
    id: string;
    content: string;
    createdAt: string;
    readAt: string | null;
    sender: {
        id: string;
        name: string;
        image: string | null;
    };
}

interface ChatWindowProps {
    applicationId: string;
    initialMessages?: Message[];
    recipientName?: string;
}

export function ChatWindow({ applicationId, initialMessages = [], recipientName }: ChatWindowProps) {
    const t = useTranslations("chat");
    const tGlobal = useTranslations();
    const { data: session } = authClient.useSession();
    const [messages, setMessages] = useState<Message[]>(initialMessages);
    const [newMessage, setNewMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [showScrollButton, setShowScrollButton] = useState(false);
    // Mirror of isSending for use inside the polling interval closure
    const isSendingRef = useRef(false);
    useEffect(() => {
        isSendingRef.current = isSending;
    }, [isSending]);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Scroll to bottom
    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, []);

    // Auto-scroll on new messages
    useEffect(() => {
        scrollToBottom();
    }, [messages, scrollToBottom]);

    // Fetch messages. `showSpinner` only on the initial load so periodic
    // refreshes don't flicker the whole window.
    const fetchMessages = useCallback(async (showSpinner = true) => {
        try {
            if (showSpinner) setIsLoading(true);
            const response = await fetch(`/api/messages?applicationId=${applicationId}`);
            const data = await response.json();

            if (response.ok) {
                setMessages(data.messages || []);
            }
        } catch (error) {
            console.error("Failed to fetch messages:", error);
        } finally {
            if (showSpinner) setIsLoading(false);
        }
    }, [applicationId]);

    // Initial fetch if no messages provided
    useEffect(() => {
        if (initialMessages.length === 0) {
            fetchMessages();
        }
    }, [initialMessages.length, fetchMessages]);

    // Real-time updates via Pusher when configured; polling as a fallback
    // for deployments without Pusher credentials or when the subscription
    // fails (auth rejected, socket unavailable).
    useEffect(() => {
        let interval: ReturnType<typeof setInterval> | null = null;
        const startPollingFallback = () => {
            if (interval) return;
            interval = setInterval(() => {
                if (!isSendingRef.current) fetchMessages(false);
            }, 5000);
        };

        const client = getPusherClient();
        if (!client) {
            startPollingFallback();
            return () => {
                if (interval) clearInterval(interval);
            };
        }

        const channelName = getApplicationChannel(applicationId);
        const channel = client.subscribe(channelName);
        const onNewMessage = (message: Message & { applicationId?: string }) => {
            setMessages((prev) => {
                if (prev.some((m) => m.id === message.id)) return prev;
                // Insert in createdAt order to keep the list sorted
                const next = [...prev, message];
                next.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
                return next;
            });
        };
        channel.bind(PUSHER_EVENTS.NEW_MESSAGE, onNewMessage);
        channel.bind("pusher:subscription_error", startPollingFallback);
        return () => {
            channel.unbind(PUSHER_EVENTS.NEW_MESSAGE, onNewMessage);
            channel.unbind("pusher:subscription_error", startPollingFallback);
            client.unsubscribe(channelName);
            if (interval) clearInterval(interval);
        };
    }, [applicationId, fetchMessages]);

    // Track scroll position for "scroll to bottom" button
    const handleScroll = () => {
        if (!containerRef.current) return;
        const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
        setShowScrollButton(scrollHeight - scrollTop - clientHeight > 100);
    };

    // Send message
    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || isSending) return;

        const content = newMessage.trim();
        setNewMessage("");
        setIsSending(true);

        // Optimistic update
        const optimisticMessage: Message = {
            id: `temp-${Date.now()}`,
            content,
            createdAt: new Date().toISOString(),
            readAt: null,
            sender: {
                id: session?.user?.id || "",
                name: session?.user?.name || "",
                image: session?.user?.image || null,
            },
        };
        setMessages((prev) => [...prev, optimisticMessage]);

        try {
            const data = await apiFetch<{ message: Message }>("/api/messages", {
                method: "POST",
                body: { applicationId, content },
            });
            // Replace optimistic message with real one
            setMessages((prev) =>
                prev.map((m) => m.id === optimisticMessage.id ? data.message : m)
            );
        } catch (error) {
            // Remove optimistic message on error and surface the failure
            setMessages((prev) => prev.filter((m) => m.id !== optimisticMessage.id));
            toast.error(translateApiError(tGlobal, error));
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-white rounded-xl border border-secondary-100 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-secondary-100 bg-secondary-50">
                <h3 className="font-medium text-secondary-900">
                    {recipientName ? t("chatWith", { name: recipientName }) : t("conversation")}
                </h3>
            </div>

            {/* Messages */}
            <div
                ref={containerRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto p-4 space-y-4 relative"
            >
                {isLoading && messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                        <Loader2 className="w-6 h-6 text-primary-500 animate-spin" />
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                        <div className="w-12 h-12 bg-secondary-100 rounded-full flex items-center justify-center mb-3">
                            <Send className="w-5 h-5 text-secondary-400" />
                        </div>
                        <p className="text-secondary-500 text-sm">
                            {t("noMessages")}. {t("startConversation")}
                        </p>
                    </div>
                ) : (
                    <>
                        {messages.map((message, index) => {
                            const isOwn = message.sender.id === session?.user?.id;
                            const prevMessage = messages[index - 1];
                            const showAvatar = !prevMessage || prevMessage.sender.id !== message.sender.id;

                            return (
                                <MessageBubble
                                    key={message.id}
                                    message={message}
                                    isOwn={isOwn}
                                    showAvatar={showAvatar}
                                />
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </>
                )}

                {/* Scroll to bottom button */}
                {showScrollButton && (
                    <button
                        onClick={scrollToBottom}
                        className="absolute bottom-4 right-4 p-2 bg-white shadow-lg border border-secondary-200 rounded-full hover:bg-secondary-50 transition-colors"
                    >
                        <ArrowDown className="w-4 h-4 text-secondary-600" />
                    </button>
                )}
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="p-4 border-t border-secondary-100">
                <div className="flex items-end gap-2">
                    <textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                handleSend(e);
                            }
                        }}
                        placeholder={t("typePlaceholder")}
                        rows={1}
                        className="flex-1 px-4 py-2.5 bg-secondary-50 border border-secondary-200 rounded-xl
                                   text-secondary-900 placeholder-secondary-400 resize-none
                                   focus:bg-white focus:border-primary-300 focus:ring-2 focus:ring-primary-100
                                   transition-all"
                        style={{ maxHeight: "120px" }}
                    />
                    <button
                        type="submit"
                        disabled={!newMessage.trim() || isSending}
                        className="p-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700
                                   disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {isSending ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <Send className="w-5 h-5" />
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
