/**
 * MessageBubble — Renders a single chat message as a styled bubble.
 *
 * Handles two states:
 *   1. Normal message — content, timestamp, optional delete button (sender only)
 *   2. Deleted message — muted "This message was deleted" placeholder
 */

"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { formatMessageTime } from "@/lib/utils/formatTime";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Trash2 } from "lucide-react";
import Image from "next/image";
import ReactionPicker from "./ReactionPicker";
import MessageReactions from "./MessageReactions";

interface MessageBubbleProps {
    message: {
        _id: Id<"messages">;
        content: string;
        createdAt: number;
        senderId: Id<"users">;
        isDeleted: boolean;
        sender: {
            name: string;
            imageUrl: string;
        };
    };
    isMyMessage: boolean;
    currentUserId: Id<"users">;
}

export default function MessageBubble({ message, isMyMessage, currentUserId }: MessageBubbleProps) {
    const deleteMessage = useMutation(api.messages.deleteMessage);
    const [confirmOpen, setConfirmOpen] = useState(false);

    const handleDelete = async () => {
        await deleteMessage({ messageId: message._id });
        setConfirmOpen(false);
    };

    // ─── Deleted message: minimal placeholder bubble ───
    if (message.isDeleted) {
        return (
            <div
                className={`flex items-end gap-2 ${isMyMessage ? "justify-end" : "justify-start"}`}
            >
                {!isMyMessage && (
                    <div className="flex-shrink-0">
                        {message.sender.imageUrl ? (
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

                <div
                    className={`max-w-[70%] rounded-2xl px-4 py-2 ${isMyMessage
                        ? "rounded-br-sm bg-gray-800/60 border border-gray-700/50"
                        : "rounded-bl-sm bg-gray-800/60 border border-gray-700/50"
                        }`}
                >
                    <p className="text-sm italic text-zinc-500">🚫 This message was deleted</p>
                </div>
            </div>
        );
    }

    // ─── Normal message bubble ───
    const formattedTime = formatMessageTime(message.createdAt);
    const canDelete = message.senderId === currentUserId;

    return (
        <div
            className={`group flex items-end gap-2 ${isMyMessage ? "justify-end" : "justify-start"}`}
        >
            {!isMyMessage && (
                <div className="flex-shrink-0">
                    {message.sender.imageUrl ? (
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
            <div className="max-w-[70%]">
                <div className="relative flex items-center gap-1">
                    <div
                        className={`rounded-2xl px-4 py-2 ${isMyMessage
                            ? "rounded-br-sm bg-purple-600 text-white"
                            : "rounded-bl-sm bg-gray-700 text-white"
                            }`}
                    >
                        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                            {message.content}
                        </p>

                        <p
                            className={`mt-1 text-[10px] ${isMyMessage ? "text-purple-200" : "text-zinc-400"
                                }`}
                        >
                            {formattedTime}
                        </p>
                    </div>

                    {/* Hover action buttons — reaction picker + delete */}
                    <div className="flex items-center gap-0.5">
                        <ReactionPicker messageId={message._id} isMyMessage={isMyMessage} />
                        {canDelete && (
                            <Popover open={confirmOpen} onOpenChange={setConfirmOpen}>
                                <PopoverTrigger asChild>
                                    <button
                                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-gray-700/50 text-zinc-400 hover:text-red-400"
                                        aria-label="Delete message"
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                </PopoverTrigger>
                                <PopoverContent
                                    className="w-auto p-3 bg-gray-800 border-gray-700 text-white"
                                    side={isMyMessage ? "left" : "right"}
                                >
                                    <p className="text-sm mb-2">Delete this message?</p>
                                    <div className="flex gap-2 justify-end">
                                        <button
                                            onClick={() => setConfirmOpen(false)}
                                            className="px-3 py-1 text-xs rounded bg-gray-700 hover:bg-gray-600 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleDelete}
                                            className="px-3 py-1 text-xs rounded bg-red-600 hover:bg-red-500 transition-colors"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </PopoverContent>
                            </Popover>
                        )}
                    </div>
                </div>

                {/* Reaction pills below the bubble */}
                <MessageReactions messageId={message._id} currentUserId={currentUserId} />
            </div>
        </div>
    );
}
