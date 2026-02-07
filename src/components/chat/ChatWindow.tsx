"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Send, Loader2, ArrowDown } from "lucide-react";
import { MessageBubble } from "./MessageBubble";

interface Message {
    id: string;
    content: string;
    createdAt: string;
    readAt: string | null;
    sender: {
        id: string;
        name: string;
        avatar: string | null;
    };
}

interface ChatWindowProps {
    applicationId: string;
    initialMessages?: Message[];
    recipientName?: string;
}

export function ChatWindow({ applicationId, initialMessages = [], recipientName }: ChatWindowProps) {
    const { data: session } = useSession();
    const [messages, setMessages] = useState<Message[]>(initialMessages);
    const [newMessage, setNewMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [showScrollButton, setShowScrollButton] = useState(false);

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

    // Fetch messages
    const fetchMessages = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await fetch(`/api/messages?applicationId=${applicationId}`);
            const data = await response.json();

            if (response.ok) {
                setMessages(data.messages || []);
            }
        } catch (error) {
            console.error("Failed to fetch messages:", error);
        } finally {
            setIsLoading(false);
        }
    }, [applicationId]);

    // Initial fetch if no messages provided
    useEffect(() => {
        if (initialMessages.length === 0) {
            fetchMessages();
        }
    }, [initialMessages.length, fetchMessages]);

    // Poll for new messages (simple alternative to Pusher)
    useEffect(() => {
        const interval = setInterval(fetchMessages, 5000);
        return () => clearInterval(interval);
    }, [fetchMessages]);

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
                avatar: session?.user?.image || null,
            },
        };
        setMessages((prev) => [...prev, optimisticMessage]);

        try {
            const response = await fetch("/api/messages", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ applicationId, content }),
            });

            if (response.ok) {
                const data = await response.json();
                // Replace optimistic message with real one
                setMessages((prev) =>
                    prev.map((m) => m.id === optimisticMessage.id ? data.message : m)
                );
            } else {
                // Remove optimistic message on error
                setMessages((prev) => prev.filter((m) => m.id !== optimisticMessage.id));
            }
        } catch (error) {
            setMessages((prev) => prev.filter((m) => m.id !== optimisticMessage.id));
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-white rounded-xl border border-secondary-100 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-secondary-100 bg-secondary-50">
                <h3 className="font-medium text-secondary-900">
                    {recipientName ? `Chat with ${recipientName}` : "Conversation"}
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
                            No messages yet. Start the conversation!
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
                        placeholder="Type a message..."
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
