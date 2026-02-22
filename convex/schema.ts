import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    users: defineTable({
        clerkId: v.string(),
        name: v.string(),
        email: v.string(),
        imageUrl: v.string(),
        isOnline: v.boolean(),
        lastSeen: v.number(),
    }).index("by_clerkId", ["clerkId"]),

    conversations: defineTable({
        participantIds: v.array(v.id("users")),
    }),

    messages: defineTable({
        conversationId: v.id("conversations"),
        senderId: v.id("users"),
        content: v.string(),
        read: v.boolean(),
        createdAt: v.number(),
    }).index("by_conversationId", ["conversationId"]),

    // Typing indicators — tracks who is currently typing in which conversation.
    // One record per user per conversation (upsert pattern, not one per keystroke).
    // Records auto-expire: the query filters out records older than 3 seconds.
    typing: defineTable({
        conversationId: v.id("conversations"),
        userId: v.id("users"),
        updatedAt: v.number(), // last keystroke timestamp — refreshed on each keystroke
    })
        .index("by_conversationId", ["conversationId"])
        .index("by_conversationId_userId", ["conversationId", "userId"]),
});
