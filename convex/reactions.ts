import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const ALLOWED_EMOJIS = ["👍", "❤️", "😂", "😮", "😢"];

export const toggleReaction = mutation({
    args: {
        messageId: v.id("messages"),
        emoji: v.string(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        if (!ALLOWED_EMOJIS.includes(args.emoji)) {
            throw new Error("Invalid emoji");
        }

        const currentUser = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (!currentUser) throw new Error("User not found");

        // One reaction per user per message — collect all (handles legacy duplicates)
        const existing = await ctx.db
            .query("reactions")
            .withIndex("by_message_user", (q) =>
                q.eq("messageId", args.messageId).eq("userId", currentUser._id)
            )
            .collect();

        const match = existing[0];

        if (match && match.emoji === args.emoji) {
            // Same emoji → un-react (delete all, cleans up any duplicates)
            await Promise.all(existing.map((r) => ctx.db.delete(r._id)));
        } else {
            // Delete any previous reactions first
            await Promise.all(existing.map((r) => ctx.db.delete(r._id)));
            await ctx.db.insert("reactions", {
                messageId: args.messageId,
                userId: currentUser._id,
                emoji: args.emoji,
            });
        }
    },
});

export const getReactions = query({
    args: {
        messageId: v.id("messages"),
    },
    handler: async (ctx, args) => {
        const reactions = await ctx.db
            .query("reactions")
            .withIndex("by_messageId", (q) => q.eq("messageId", args.messageId))
            .collect();

        // Group by emoji → array format (Convex doesn't allow emoji chars as object keys)
        const map = new Map<string, string[]>();
        for (const r of reactions) {
            const arr = map.get(r.emoji) ?? [];
            arr.push(r.userId);
            map.set(r.emoji, arr);
        }

        return Array.from(map.entries()).map(([emoji, userIds]) => ({
            emoji,
            count: userIds.length,
            userIds,
        }));
    },
});
