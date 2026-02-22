/**
 * Messages Module
 *
 * Messages are the core of the chat app. This file contains just two functions:
 *   - `send`  → writes a new message to a conversation
 *   - `getByConversation` → reads all messages in a conversation
 *
 * Convex makes the read function (`getByConversation`) a LIVE SUBSCRIPTION
 * automatically. When any client calls `useQuery(api.messages.getByConversation)`,
 * Convex keeps a WebSocket connection open and pushes new messages to the
 * frontend instantly — no polling, no manual refetch, no "pull to refresh".
 *
 * SECURITY MODEL:
 * Both functions verify that the requesting user is a participant in the
 * conversation. This prevents malicious users from reading or writing
 * messages in conversations they don't belong to.
 */

import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * send — Insert a new message into a conversation.
 *
 * Called when a user types a message and hits Enter/Send.
 * The message is stored with `read: false` by default — the recipient's
 * client will mark it as read when they view the conversation.
 *
 * @param conversationId - The conversation to send the message in
 * @param content - The text content of the message
 * @returns The newly created message's document ID
 */
export const send = mutation({
    args: {
        conversationId: v.id("conversations"),
        content: v.string(),
    },
    handler: async (ctx, args) => {
        // Step 1: Authenticate the current user
        // Get the identity from the Clerk JWT token attached to this request.
        // If there's no valid token, the user isn't logged in.
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Not authenticated");
        }

        // Find the current user's document using their Clerk ID
        const currentUser = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (!currentUser) {
            throw new Error("User not found in database");
        }

        // Step 2: Fetch the conversation document
        // We need this to verify the user is actually a participant.
        const conversation = await ctx.db.get(args.conversationId);
        if (!conversation) {
            throw new Error("Conversation not found");
        }

        // Step 3: SECURITY CHECK — Verify the user belongs to this conversation
        //
        // NEVER TRUST THE CLIENT — always verify on the server that the user
        // belongs to this conversation. A malicious user could modify the
        // frontend code to send messages to any conversationId. This check
        // ensures that even if they do, the server will reject it.
        //
        // This is a fundamental principle in backend security:
        // "Client-side validation is for UX, server-side validation is for security."
        const isParticipant = conversation.participantIds.includes(currentUser._id);
        if (!isParticipant) {
            throw new Error("Unauthorized: You are not a participant in this conversation");
        }

        // Step 4: Insert the message
        // - senderId: tracks who sent it (for displaying on correct side of chat)
        // - read: false by default — the recipient hasn't seen it yet
        // - createdAt: timestamp for sorting messages chronologically
        const messageId = await ctx.db.insert("messages", {
            conversationId: args.conversationId,
            senderId: currentUser._id,
            content: args.content,
            read: false,
            createdAt: Date.now(),
        });

        return messageId;
    },
});

/**
 * getByConversation — Fetch all messages in a conversation, enriched with sender info.
 *
 * This is subscribed to via `useQuery()` in the frontend, which means it
 * automatically updates in real-time when new messages arrive. The frontend
 * doesn't need to poll or manually refetch — Convex pushes updates via WebSocket.
 *
 * We enrich messages with sender info here on the BACKEND instead of making
 * separate queries in the frontend — fewer network round trips, and the
 * frontend gets a clean, ready-to-render data structure.
 *
 * @param conversationId - The conversation to fetch messages for
 * @returns Array of messages, each enriched with sender's name and avatar,
 *          sorted oldest-first (newest at the bottom, like WhatsApp)
 */
export const getByConversation = query({
    args: {
        conversationId: v.id("conversations"),
    },
    handler: async (ctx, args) => {
        // Authenticate — return empty array if not logged in
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            return [];
        }

        // Find the current user's document
        const currentUser = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (!currentUser) {
            return [];
        }

        // SECURITY CHECK — same auth check as in `send` mutation.
        // Consistent security pattern: EVERY function that accesses
        // conversation data must verify the user is a participant.
        // This prevents users from reading other people's private messages
        // by guessing or brute-forcing conversation IDs.
        const conversation = await ctx.db.get(args.conversationId);
        if (!conversation) {
            return [];
        }

        const isParticipant = conversation.participantIds.includes(currentUser._id);
        if (!isParticipant) {
            return [];
        }

        // Fetch all messages in this conversation using the index
        // Order: ascending (oldest first → newest at the bottom)
        // This matches the natural reading order in chat apps — you scroll
        // down to see newer messages.
        const conversationMessages = await ctx.db
            .query("messages")
            .withIndex("by_conversationId", (q) =>
                q.eq("conversationId", args.conversationId)
            )
            .order("asc")
            .collect();

        // Enrich each message with the sender's user data (name + avatar)
        //
        // WHY WE DO THIS ON THE BACKEND:
        // Instead of returning raw messages and making the frontend call
        // `useQuery(api.users.getById, senderId)` for EACH message,
        // we look up the sender here. Benefits:
        //   1. Fewer network round trips (1 query instead of N+1)
        //   2. Frontend code is simpler — just render what we return
        //   3. All data arrives together, no loading waterfalls
        //
        // This is the "Backend for Frontend" (BFF) pattern — the server
        // shapes the data exactly how the UI needs it.
        const messagesWithSenders = await Promise.all(
            conversationMessages.map(async (message) => {
                // Look up the sender's user document
                const senderUser = await ctx.db.get(message.senderId);

                return {
                    ...message,
                    sender: {
                        name: senderUser?.name ?? "Unknown",
                        imageUrl: senderUser?.imageUrl ?? "",
                    },
                };
            })
        );

        return messagesWithSenders;
    },
});

// ─── Read Receipts ────────────────────────────────────────────────────────

/**
 * markAsRead — Marks all unread messages from the OTHER person as read.
 *
 * Called when the user opens a conversation or when new messages arrive
 * while the conversation is already open. This clears the unread badge
 * in the sidebar.
 *
 * WHY BATCH UPDATE:
 * We update ALL unread messages in a single operation rather than one at a time.
 * This is more efficient because:
 *   1. Fewer database round trips — one query + N patches vs N queries + N patches
 *   2. Convex batches mutations atomically — all updates succeed or none do
 *   3. The unread count drops to zero in one reactive update, not gradually
 *
 * WHY ONLY OTHER PERSON'S MESSAGES:
 * We only mark messages from the OTHER person as read — our own sent messages
 * are irrelevant to unread count. The user already knows about messages they
 * sent themselves; "unread" only applies to incoming messages.
 *
 * REAL-TIME UPDATE CHAIN:
 * 1. User opens conversation → markAsRead mutation fires
 * 2. Messages in DB get updated (read: false → true)
 * 3. Convex detects the change and re-evaluates conversations.getAll query
 * 4. getAll recomputes unreadCount (now 0) and pushes via WebSocket
 * 5. Sidebar ConversationItem re-renders with badge removed — all automatic
 */
export const markAsRead = mutation({
    args: {
        conversationId: v.id("conversations"),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return null;

        const currentUser = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (!currentUser) return null;

        // Find all unread messages in this conversation that were sent by
        // the OTHER person (not us). These are the messages we need to mark
        // as read because the current user is now viewing them.
        const unreadMessages = await ctx.db
            .query("messages")
            .withIndex("by_conversationId", (q) =>
                q.eq("conversationId", args.conversationId)
            )
            .collect();

        // Filter: only messages that are unread AND from the other person
        // We filter after collecting because Convex indexes can't filter
        // on multiple non-indexed fields simultaneously
        const messagesToMark = unreadMessages.filter(
            (msg) => msg.senderId !== currentUser._id && msg.read === false
        );

        // Batch update — mark all matching messages as read at once
        // Promise.all runs all patches in parallel for maximum efficiency
        await Promise.all(
            messagesToMark.map((msg) =>
                ctx.db.patch(msg._id, { read: true })
            )
        );

        return messagesToMark.length; // return count for debugging
    },
});
