/**
 * Typing Indicators — Backend mutations and query for real-time typing status.
 *
 * HOW IT WORKS:
 * When a user types, the frontend calls `setTyping` which upserts a record
 * in the `typing` table. The `getTyping` query returns all users currently
 * typing in a conversation (excluding the current user), filtered to only
 * records updated within the last 3 seconds.
 *
 * WHY UPSERT (not insert):
 * If we inserted a new record on every keystroke, a fast typer would create
 * hundreds of records per minute. Instead, we maintain ONE record per user
 * per conversation and just update its `updatedAt` timestamp on each keystroke.
 * This keeps the table small and queries fast.
 *
 * WHY 3-SECOND EXPIRY WINDOW:
 * If the user's browser crashes or they lose internet, `clearTyping` never
 * gets called. The 3-second window ensures stale "typing" indicators
 * automatically disappear — no cleanup cron job needed.
 */

import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * setTyping — Marks the current user as typing in a conversation.
 *
 * Upsert pattern — one record per user per conversation, not one per keystroke.
 * If a typing record already exists for this (conversationId + userId), we
 * update its `updatedAt` timestamp. If not, we insert a new record.
 *
 * Called on each keystroke (debounced on the frontend to reduce calls).
 */
export const setTyping = mutation({
    args: {
        conversationId: v.id("conversations"),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return null;

        // Find the current user's Convex document
        const user = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (!user) return null;

        // Check if a typing record already exists for this user + conversation
        const existingRecord = await ctx.db
            .query("typing")
            .withIndex("by_conversationId_userId", (q) =>
                q.eq("conversationId", args.conversationId).eq("userId", user._id)
            )
            .unique();

        if (existingRecord) {
            // Update existing record's timestamp (upsert: UPDATE path)
            await ctx.db.patch(existingRecord._id, {
                updatedAt: Date.now(),
            });
        } else {
            // Create a new typing record (upsert: INSERT path)
            await ctx.db.insert("typing", {
                conversationId: args.conversationId,
                userId: user._id,
                updatedAt: Date.now(),
            });
        }
    },
});

/**
 * clearTyping — Removes the current user's typing indicator.
 *
 * Called when a message is sent or when the user stops typing (after the
 * debounce timeout expires). Deleting the record immediately removes the
 * "typing" indicator for other users without waiting for the 3-second expiry.
 */
export const clearTyping = mutation({
    args: {
        conversationId: v.id("conversations"),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return null;

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (!user) return null;

        // Find and delete the typing record for this user + conversation
        const existingRecord = await ctx.db
            .query("typing")
            .withIndex("by_conversationId_userId", (q) =>
                q.eq("conversationId", args.conversationId).eq("userId", user._id)
            )
            .unique();

        if (existingRecord) {
            await ctx.db.delete(existingRecord._id);
        }
    },
});

/**
 * getTyping — Returns the names of users currently typing in a conversation.
 *
 * Excludes the current user (you don't need to see your own typing indicator).
 * Filters to only records where updatedAt is within the last 3 seconds —
 * the 3-second window handles the case where clearTyping wasn't called
 * (e.g., browser crash, lost internet, mobile app frozen).
 *
 * Returns an array of user names (not full user objects) because the
 * TypingIndicator component only needs names for display.
 */
export const getTyping = query({
    args: {
        conversationId: v.id("conversations"),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        const currentUser = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (!currentUser) return [];

        // Get all typing records for this conversation
        const typingRecords = await ctx.db
            .query("typing")
            .withIndex("by_conversationId", (q) =>
                q.eq("conversationId", args.conversationId)
            )
            .collect();

        // Filter: exclude current user AND only include records from the last 3 seconds
        const threeSecondsAgo = Date.now() - 3000;
        const activeTypers = typingRecords.filter(
            (record) =>
                record.userId !== currentUser._id &&
                record.updatedAt > threeSecondsAgo
        );

        // Enrich with user names for display
        const typingUsers = await Promise.all(
            activeTypers.map(async (record) => {
                const user = await ctx.db.get(record.userId);
                return user?.name ?? "Unknown";
            })
        );

        return typingUsers;
    },
});
