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
});
