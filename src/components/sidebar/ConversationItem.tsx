/**
 * ConversationItem — Renders a single conversation row in the sidebar.
 * Props: conversation data, other user info, last message, active state, unread count.
 *
 * Kept as a separate component so ConversationList stays clean and this
 * item can be tested independently. Each row shows:
 *   - Avatar (with online dot)
 *   - User name
 *   - Last message preview (truncated)
 *   - Timestamp of last message
 */

"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { Id } from "../../../convex/_generated/dataModel";
import { formatMessageTime } from "@/lib/utils/formatTime";
import OnlineIndicator from "../ui/OnlineIndicator";

interface ConversationItemProps {
    conversationId: Id<"conversations">;
    otherUser: {
        name: string;
        imageUrl: string;
        isOnline: boolean;
    };
    lastMessage: {
        content: string;
        createdAt: number;
    } | null;
    isActive: boolean;
    // unreadCount: number of unread messages from the other person.
    // Computed in the backend (conversations.getAll) — not fetched separately.
    unreadCount: number;
}

export default function ConversationItem({
    conversationId,
    otherUser,
    lastMessage,
    isActive,
    unreadCount,
}: ConversationItemProps) {
    const router = useRouter();

    // Timestamp formatting is now handled by the shared formatMessageTime utility
    // Consistent formatting across sidebar preview and message bubbles

    return (
        <div
            onClick={() => router.push(`/conversations/${conversationId}`)}
            className={`flex cursor-pointer items-center gap-3 rounded-lg px-3 py-3 transition-colors ${isActive
                ? "bg-gray-700/70"
                : "hover:bg-gray-700/30"
                }`}
        // isActive: highlights the currently open conversation so the user
        // knows which chat they're viewing — important for spatial awareness
        >
            {/* ===== Avatar with Online Indicator ===== */}
            <div className="relative flex-shrink-0">
                {otherUser.imageUrl ? (
                    // Next.js Image automatically optimizes format (WebP),
                    // applies lazy loading, and prevents layout shift with
                    // explicit width/height — unlike raw <img> tags.
                    <Image
                        src={otherUser.imageUrl}
                        alt={otherUser.name}
                        width={44}
                        height={44}
                        className="h-11 w-11 rounded-full object-cover"
                    />
                ) : (
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-cyan-600 text-sm font-semibold text-white">
                        {otherUser.name.charAt(0).toUpperCase()}
                    </div>
                )}

                {/* Online status — uses shared OnlineIndicator */}
                <span className="absolute bottom-0 right-0 rounded-full border-2 border-[#1a1d27]">
                    <OnlineIndicator isOnline={otherUser.isOnline} size="md" />
                </span>
            </div>

            {/* ===== Conversation Info (Name + Last Message) ===== */}
            <div className="flex-1 overflow-hidden">
                <div className="flex items-center justify-between">
                    <h3 className="truncate text-sm font-semibold text-white">
                        {otherUser.name}
                    </h3>

                    {/* Timestamp of the last message */}
                    {lastMessage && (
                        <span className="ml-2 flex-shrink-0 text-[11px] text-zinc-500">
                            {formatMessageTime(lastMessage.createdAt)}
                        </span>
                    )}
                </div>

                <div className="flex items-center justify-between">
                    {/* Last message preview — truncated to one line */}
                    <p className="truncate text-xs text-zinc-400">
                        {lastMessage?.content ?? "No messages yet"}
                    </p>

                    {/* Unread message badge */}
                    {/* Don't render the badge element at all when zero — not just hidden, */}
                    {/* fully absent from DOM. This avoids an invisible element taking up */}
                    {/* space or being picked up by screen readers. */}
                    {unreadCount > 0 && (
                        <span className="ml-2 flex h-5 min-w-5 flex-shrink-0 items-center justify-center rounded-full bg-purple-600 px-1 text-[10px] font-bold text-white">
                            {/* 9+ cap prevents layout breaking with very large numbers */}
                            {/* (e.g., "147" would overflow the circle and look broken) */}
                            {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
