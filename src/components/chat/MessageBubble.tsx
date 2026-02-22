/**
 * MessageBubble — Renders a single chat message as a styled bubble.
 * Props: message (content, createdAt, sender info) and isMyMessage boolean.
 *
 * The isMyMessage boolean controls alignment and color — keeps the logic simple.
 * My messages go RIGHT with accent color, their messages go LEFT with dark gray.
 * This is the same pattern used by WhatsApp, iMessage, and Telegram.
 */

"use client";

import { formatMessageTime } from "@/lib/utils/formatTime";
import Image from "next/image";

interface MessageBubbleProps {
    message: {
        content: string;
        createdAt: number;
        sender: {
            name: string;
            imageUrl: string;
        };
    };
    isMyMessage: boolean;
}

export default function MessageBubble({ message, isMyMessage }: MessageBubbleProps) {
    // Smart timestamp formatting using shared utility
    // Rules: today → "2:34 PM", this year → "Feb 15, 2:34 PM", older → "Feb 15 2023, 2:34 PM"
    const formattedTime = formatMessageTime(message.createdAt);

    return (
        <div
            className={`flex items-end gap-2 ${isMyMessage ? "justify-end" : "justify-start"
                }`}
        // justify-end: pushes my messages to the RIGHT side
        // justify-start: keeps their messages on the LEFT side
        >
            {/* Show sender's avatar ONLY for the other person's messages */}
            {/* My messages don't need an avatar — I know who I am */}
            {!isMyMessage && (
                <div className="flex-shrink-0">
                    {message.sender.imageUrl ? (
                        // Next.js Image automatically optimizes format (WebP),
                        // applies lazy loading, and prevents layout shift with
                        // explicit width/height — unlike raw <img> tags.
                        <Image
                            src={message.sender.imageUrl}
                            alt={message.sender.name}
                            width={28}
                            height={28}
                            className="h-7 w-7 rounded-full object-cover"
                        />
                    ) : (
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-cyan-600 text-xs font-semibold text-white">
                            {message.sender.name.charAt(0).toUpperCase()}
                        </div>
                    )}
                </div>
            )}

            {/* ===== Message Bubble ===== */}
            <div
                className={`max-w-[70%] rounded-2xl px-4 py-2 ${isMyMessage
                    ? "rounded-br-sm bg-purple-600 text-white"
                    : "rounded-bl-sm bg-gray-700 text-white"
                    }`}
            // max-w-[70%]: prevents messages from spanning the full width
            // rounded-br-sm / rounded-bl-sm: creates the chat bubble "tail" effect
            //   by un-rounding one corner (like WhatsApp's bubble shape)
            >
                {/* Message text content */}
                <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                    {message.content}
                </p>

                {/* Timestamp below the message */}
                <p
                    className={`mt-1 text-[10px] ${isMyMessage ? "text-purple-200" : "text-zinc-400"
                        }`}
                >
                    {formattedTime}
                </p>
            </div>
        </div>
    );
}
