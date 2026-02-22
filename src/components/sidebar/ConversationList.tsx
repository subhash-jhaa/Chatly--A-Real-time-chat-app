/**
 * ConversationList — Renders all conversations the current user is part of.
 * No props — fetches data directly via Convex's useQuery subscription.
 *
 * useQuery here is a LIVE SUBSCRIPTION — the sidebar updates automatically
 * when a new message arrives in any conversation, or when a new conversation
 * is created. No manual refetch, no polling, no "pull to refresh".
 * This is what makes the sidebar feel "live" and responsive.
 */

"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { usePathname } from "next/navigation";
import ConversationItem from "./ConversationItem";
import ConversationSkeleton from "../ui/ConversationSkeleton";
import EmptyState from "../ui/EmptyState";

export default function ConversationList() {
    // ─── Real-Time Data Subscription ──────────────────────────────────────
    // This single query gives us everything the sidebar needs:
    //   - All conversations the user is part of
    //   - The other user's info (name, avatar, online status)
    //   - The last message in each conversation (for preview text)
    // Convex keeps this data in sync via WebSocket — no polling needed.
    const conversations = useQuery(api.conversations.getAll);

    // usePathname returns the current URL path (e.g., "/conversations/abc123")
    // We use this to highlight the currently active conversation in the sidebar
    const pathname = usePathname();

    // ─── Loading State ────────────────────────────────────────────────────
    // Convex useQuery returns undefined while loading and null if the query
    // has no results — we handle both states explicitly
    if (conversations === undefined) {
        return <ConversationSkeleton />;
    }

    // ─── Empty State ──────────────────────────────────────────────────────
    if (conversations.length === 0) {
        return (
            <EmptyState
                icon="💬"
                title="No conversations yet"
                description="Search for someone to start chatting!"
            />
        );
    }

    // ─── Conversation Rows ────────────────────────────────────────────────
    return (
        <div className="flex-1 overflow-y-auto px-2 pb-2">
            <div className="flex flex-col gap-1">
                {conversations.map(({ conversation, otherUser, lastMessage, unreadCount }) => {
                    // Skip conversations where the other user was deleted
                    if (!otherUser) return null;

                    // Determine if this conversation is the one currently being viewed
                    // by comparing the URL path to the conversation ID
                    const isActive = pathname === `/conversations/${conversation._id}`;

                    return (
                        <ConversationItem
                            key={conversation._id}
                            conversationId={conversation._id}
                            otherUser={{
                                name: otherUser.name,
                                imageUrl: otherUser.imageUrl,
                                isOnline: otherUser.isOnline,
                            }}
                            lastMessage={lastMessage}
                            isActive={isActive}
                            unreadCount={unreadCount}
                        />
                    );
                })}
            </div>
        </div>
    );
}
