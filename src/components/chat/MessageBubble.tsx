import Image from "next/image";
import { Check, CheckCheck } from "lucide-react";

interface MessageBubbleProps {
    message: {
        id: string;
        content: string;
        createdAt: Date | string;
        readAt: Date | string | null;
        sender: {
            id: string;
            name: string;
            image: string | null;
        };
    };
    isOwn: boolean;
    showAvatar?: boolean;
}

export function MessageBubble({ message, isOwn, showAvatar = true }: MessageBubbleProps) {
    const time = new Date(message.createdAt);
    const isRead = !!message.readAt;

    return (
        <div className={`flex gap-2 ${isOwn ? "flex-row-reverse" : ""}`}>
            {/* Avatar */}
            {showAvatar && (
                <div className="flex-shrink-0">
                    {message.sender.image ? (
                        <Image
                            src={message.sender.image}
                            alt={message.sender.name}
                            width={32}
                            height={32}
                            className="rounded-full"
                        />
                    ) : (
                        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-xs font-medium text-primary-700">
                            {message.sender.name.charAt(0)}
                        </div>
                    )}
                </div>
            )}

            {/* Spacer when no image */}
            {!showAvatar && <div className="w-8" />}

            {/* Bubble */}
            <div className={`max-w-[70%] ${isOwn ? "items-end" : "items-start"}`}>
                <div
                    className={`px-4 py-2.5 rounded-2xl ${isOwn
                        ? "bg-primary-600 text-white rounded-tr-sm"
                        : "bg-secondary-100 text-secondary-900 rounded-tl-sm"
                        }`}
                >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                        {message.content}
                    </p>
                </div>

                {/* Time and read status */}
                <div className={`flex items-center gap-1 mt-1 px-1 ${isOwn ? "justify-end" : ""}`}>
                    <span className="text-[10px] text-secondary-400">
                        {time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                    {isOwn && (
                        isRead ? (
                            <CheckCheck className="w-3 h-3 text-primary-400" />
                        ) : (
                            <Check className="w-3 h-3 text-secondary-300" />
                        )
                    )}
                </div>
            </div>
        </div>
    );
}
