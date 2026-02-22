/**
 * Conversation Page — The main chat view for a specific conversation.
 *
 * This page is the GLUE — it fetches data from Convex and passes it down
 * to dumb, presentational components. It doesn't render any UI itself
 * beyond assembling the child components into a layout.
 *
 * Architecture pattern: "Smart Parent, Dumb Children"
 *   - This page = "smart" (handles data fetching, mutations, state)
 *   - ChatHeader, MessageList, MessageInput = "dumb" (just render props)
 *   - This separation makes each component testable and explainable
 *
 * Route: /conversations/[id] — the [id] is the Convex conversation document ID
 *
 * RESPONSIVE BEHAVIOR:
 * On mobile, this page occupies the FULL SCREEN (sidebar is hidden via CSS
 * in layout.tsx). The ChatHeader includes a back arrow (md:hidden) to let
 * users return to the conversation list.
 * On desktop, this page sits to the right of the always-visible sidebar.
 *
 * ERROR HANDLING:
 * - sendMessage: wrapped in try/catch — shows a toast on failure so the user
 *   knows their message wasn't delivered (instead of silently dropping it)
 * - Invalid conversationId: if the user navigates to a conversation they
 *   don't belong to, we redirect to / instead of showing a broken page
 */

"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { use, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import ChatHeader from "@/components/chat/ChatHeader";
import MessageList from "@/components/chat/MessageList";
import MessageInput from "@/components/chat/MessageInput";
import MessageSkeleton from "@/components/ui/MessageSkeleton";
import TypingIndicator from "@/components/chat/TypingIndicator";
import { useTypingIndicator } from "@/hooks/useTypingIndicator";

// Next.js 15+ uses `use()` to unwrap params promises in client components
interface ConversationPageProps {
    params: Promise<{ id: string }>;
}

export default function ConversationPage({ params }: ConversationPageProps) {
    // Unwrap the route params — `id` is the conversation's Convex document ID
    // Next.js 15 changed params to be a Promise, so we use React's `use()` hook
    const { id } = use(params);
    const conversationId = id as Id<"conversations">;
    const router = useRouter();

    // ─── Data Fetching (Real-Time Subscriptions) ──────────────────────────
    //
    // Both of these are LIVE subscriptions via Convex's WebSocket.
    // When a new message is sent by either user, `messages` updates instantly.
    // When the other user changes their profile, `currentUser` updates too.
    const messages = useQuery(api.messages.getByConversation, { conversationId });
    const currentUser = useQuery(api.users.getMe);

    // We need the conversation details to find the OTHER participant
    const conversations = useQuery(api.conversations.getAll);

    // ─── Mutation for Sending Messages ────────────────────────────────────
    const sendMessage = useMutation(api.messages.send);

    /**
     * handleSendMessage — Called by MessageInput when the user sends a message.
     *
     * WHAT ERROR WE'RE CATCHING:
     * The sendMessage mutation can fail if the Convex server rejects the request
     * (e.g., network timeout, auth token expired, or the conversation was deleted
     * between when the page loaded and when the user hit Send).
     *
     * WHAT THE USER SEES INSTEAD:
     * A toast notification at the bottom-right saying "Failed to send message" —
     * this tells the user to try again without breaking the chat interface.
     * Without this try/catch, the error would bubble up to the ErrorBoundary
     * and crash the entire chat view, which is way too aggressive for a
     * transient network error.
     */
    const handleSendMessage = async (content: string) => {
        try {
            await sendMessage({ conversationId, content });
        } catch (error) {
            // Show a non-intrusive toast — the user can retry immediately
            toast.error("Failed to send message. Please try again.");
            console.error("[sendMessage] Error:", error);
        }
    };

    // ─── Typing Indicator Hook ───────────────────────────────────────────
    // notifyTyping: fires on each keystroke (debounced inside the hook)
    // notifyStopped: fires immediately when user sends a message
    const { notifyTyping, notifyStopped } = useTypingIndicator(conversationId);

    // ─── Mark Messages as Read ───────────────────────────────────────────
    const markAsRead = useMutation(api.messages.markAsRead);

    // We pass `messages` as a dependency so markAsRead fires each time new
    // messages arrive while the chat is open — not just on first load.
    // Without this, if Alice sends 3 messages while Bob has the chat open,
    // only the messages present on initial load would be marked as read.
    //
    // REAL-TIME CHAIN:
    // New message arrives → messages array updates → useEffect fires →
    // markAsRead mutation runs → unreadCount recomputes → sidebar badge clears
    useEffect(() => {
        if (messages && messages.length > 0) {
            markAsRead({ conversationId }).catch(console.error);
        }
    }, [conversationId, messages, markAsRead]);

    // ─── Loading State ────────────────────────────────────────────────────
    // Convex useQuery returns undefined while loading and null if the query
    // has no results — we handle both states explicitly
    if (messages === undefined || currentUser === undefined || conversations === undefined) {
        return (
            <div className="flex h-full flex-col bg-[#0f1117]">
                {/* Header skeleton */}
                <div className="flex items-center gap-3 border-b border-gray-700 bg-[#1a1d27] px-4 py-3 md:px-6">
                    {/* px-4 on mobile, md:px-6 on desktop — matches ChatHeader responsive padding */}
                    <div className="h-10 w-10 animate-pulse rounded-full bg-gray-700/50" />
                    <div className="h-4 w-28 animate-pulse rounded bg-gray-700/50" />
                </div>

                {/* Messages area skeleton — alternating left/right bubbles */}
                <MessageSkeleton />

                {/* Input skeleton */}
                <div className="border-t border-gray-700 bg-[#1a1d27] p-4">
                    <div className="h-11 animate-pulse rounded-xl bg-gray-700/50" />
                </div>
            </div>
        );
    }

    // ─── Find the Other User in This Conversation ─────────────────────────
    // We look through the conversations list to find this specific conversation,
    // then extract the other user's info from the enriched data
    const currentConversation = conversations.find(
        (c) => c.conversation._id === conversationId
    );

    const otherUser = currentConversation?.otherUser;

    // ─── Auth Error Handling ─────────────────────────────────────────────
    // WHAT ERROR WE'RE CATCHING:
    // If a user navigates to a conversationId they don't belong to (e.g., by
    // typing a random ID in the URL bar, or a bookmarked conversation that was
    // deleted), conversations.getAll won't include it.
    //
    // WHAT THE USER SEES INSTEAD:
    // We redirect them to the home page (/) rather than showing a broken or
    // empty chat view. This is a graceful degradation — the user lands on a
    // page that works instead of staring at an error.
    if (!otherUser || !currentUser) {
        router.push("/");
        return null;
    }

    // ─── Assemble the Chat Interface ──────────────────────────────────────
    // Three stacked sections: Header (fixed top) + Messages (scrollable) + Input (fixed bottom)
    return (
        <div className="flex h-full flex-col bg-[#0f1117]">
            {/* WHO you're talking to */}
            <ChatHeader
                otherUser={{
                    name: otherUser.name,
                    imageUrl: otherUser.imageUrl,
                    isOnline: otherUser.isOnline,
                }}
            />

            {/* WHAT was said — scrollable message history */}
            <MessageList
                messages={messages}
                currentUserId={currentUser._id}
            />

            {/* WHO is typing — shows "[Name] is typing" with bouncing dots */}
            {/* Positioned between messages and input so the indicator is visible */}
            {/* without scrolling — exactly where the next message will appear */}
            <TypingIndicator conversationId={conversationId} />

            {/* HOW to respond — message composition */}
            {/* onTyping/onStoppedTyping are from useTypingIndicator hook */}
            <MessageInput
                onSendMessage={handleSendMessage}
                onTyping={notifyTyping}
                onStoppedTyping={notifyStopped}
            />
        </div>
    );
}

