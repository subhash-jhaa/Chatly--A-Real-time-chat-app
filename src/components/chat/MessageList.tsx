/**
 * MessageList — Renders the scrollable list of all messages in a conversation.
 * Props: messages array and currentUserId to determine message ownership.
 *
 * Determines message ownership by comparing sender ID to current user ID.
 * This component maps messages to MessageBubble components, inserts date
 * divider labels between messages from different days, and uses smart
 * auto-scrolling via the useAutoScroll hook.
 *
 * SMART AUTO-SCROLL:
 * Instead of always force-scrolling to the bottom on every new message,
 * we only auto-scroll when the user is already at the bottom. If they're
 * reading old messages, we show a floating "New messages" button instead.
 * All scroll logic lives in the useAutoScroll hook — this component just
 * renders the UI.
 */

"use client";

import MessageBubble from "./MessageBubble";
import { Id } from "../../../convex/_generated/dataModel";
import { getDateDividerLabel } from "@/lib/utils/formatTime";
import EmptyState from "../ui/EmptyState";
import { useAutoScroll } from "@/hooks/useAutoScroll";
import { ArrowDown } from "lucide-react";

interface Message {
    _id: Id<"messages">;
    content: string;
    createdAt: number;
    senderId: Id<"users">;
    sender: {
        name: string;
        imageUrl: string;
    };
}

interface MessageListProps {
    messages: Message[];
    currentUserId: Id<"users">;
}

/**
 * shouldShowDateDivider — Determines if a date divider should be inserted
 * between two consecutive messages.
 *
 * We compare each message to the PREVIOUS one — if the calendar date changed,
 * we insert a divider. This creates visual separation between days, like:
 *   ── Yesterday ──
 *   [messages from yesterday]
 *   ── Today ──
 *   [messages from today]
 */
function shouldShowDateDivider(
    currentMessage: Message,
    previousMessage: Message | undefined
): boolean {
    // Always show a divider before the very first message
    if (!previousMessage) return true;

    // Compare the calendar date (day/month/year) of both messages
    const currentDate = new Date(currentMessage.createdAt).toDateString();
    const previousDate = new Date(previousMessage.createdAt).toDateString();

    // If the dates are different, we need a divider between them
    return currentDate !== previousDate;
}

export default function MessageList({ messages, currentUserId }: MessageListProps) {
    // All scroll logic is encapsulated in the useAutoScroll hook —
    // this component doesn't need to know about scroll positions,
    // thresholds, or timing. It just uses the returned refs and state.
    const {
        containerRef,
        bottomRef,
        scrollToBottom,
        hasNewMessages,
        handleScroll,
    } = useAutoScroll({ messages });

    // Empty conversation state
    if (messages.length === 0) {
        return (
            <EmptyState
                icon="👋"
                title="No messages yet"
                description="Say hello to start the conversation!"
            />
        );
    }

    return (
        // relative container — positions the floating "New messages" button
        <div className="relative flex-1 overflow-hidden">
            {/* Scrollable message area — containerRef tracks scroll position */}
            <div
                ref={containerRef}
                onScroll={handleScroll}
                className="h-full overflow-y-auto p-4"
            >
                {/* Message container with consistent spacing between bubbles */}
                <div className="flex flex-col gap-3">
                    {messages.map((message, index) => {
                        const previousMessage = messages[index - 1];
                        const showDivider = shouldShowDateDivider(message, previousMessage);

                        return (
                            <div key={message._id}>
                                {/* Date Divider — centered label showing "Today", "Yesterday", or "Feb 15" */}
                                {showDivider && (
                                    <div className="my-4 flex items-center justify-center">
                                        <div className="rounded-full bg-gray-700/50 px-3 py-1">
                                            <span className="text-[11px] font-medium text-zinc-400">
                                                {getDateDividerLabel(message.createdAt)}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                <MessageBubble
                                    message={message}
                                    isMyMessage={message.senderId === currentUserId}
                                />
                            </div>
                        );
                    })}

                    {/* Invisible anchor div — scrollIntoView targets this element */}
                    {/* Placed as the LAST child so scrolling here = scrolling to bottom */}
                    <div ref={bottomRef} />
                </div>
            </div>

            {/* ===== Floating "New Messages" Button ===== */}
            {/* Gives users agency — they can choose to jump to new messages */}
            {/* without being forced. Only appears when the user is scrolled up */}
            {/* and new messages have arrived below their current view. */}
            {hasNewMessages && (
                <button
                    onClick={scrollToBottom}
                    className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 rounded-full bg-purple-600 px-4 py-2 text-xs font-medium text-white shadow-lg transition-all hover:bg-purple-700 hover:shadow-xl"
                >
                    <ArrowDown className="h-3.5 w-3.5" />
                    New messages
                </button>
            )}
        </div>
    );
}
