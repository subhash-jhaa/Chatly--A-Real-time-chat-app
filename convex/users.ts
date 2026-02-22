import { mutation, query } from "./_generated/server";

// Store or update the current authenticated user
export const store = mutation({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            // Return null instead of throwing — handles auth pages and loading states
            return null;
        }

        // Check if user already exists
        const existingUser = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (existingUser) {
            // Update existing user
            await ctx.db.patch(existingUser._id, {
                name: identity.name ?? existingUser.name,
                imageUrl: identity.pictureUrl ?? existingUser.imageUrl,
                isOnline: true,
                lastSeen: Date.now(),
            });
            return existingUser._id;
        }

        // Insert new user
        const userId = await ctx.db.insert("users", {
            clerkId: identity.subject,
            name: identity.name ?? "Unknown",
            email: identity.email ?? "",
            imageUrl: identity.pictureUrl ?? "",
            isOnline: true,
            lastSeen: Date.now(),
        });

        return userId;
    },
});

// Get the current authenticated user's document
export const getMe = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            return null;
        }

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .unique();

        return user;
    },
});

// Get all users except the current user
export const getAll = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            return [];
        }

        const allUsers = await ctx.db.query("users").collect();

        return allUsers.filter((user) => user.clerkId !== identity.subject);
    },
});

// ─── Presence Mutations ───────────────────────────────────────────────────

/**
 * setOnline — Marks the current user as online.
 * Called when the user opens the app or returns to the tab.
 *
 * No args needed — we identify the user from their auth token.
 * Sets isOnline: true and updates lastSeen to the current timestamp.
 */
export const setOnline = mutation({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return null;

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (!user) return null;

        await ctx.db.patch(user._id, {
            isOnline: true,
            lastSeen: Date.now(),
        });
    },
});

/**
 * setOffline — Marks the current user as offline.
 * Called when the user closes the tab or switches away.
 *
 * lastSeen is updated here so we can show "Last seen X minutes ago"
 * in the chat header and contact list later. This timestamp represents
 * the moment the user was LAST active, not when they first went offline.
 */
export const setOffline = mutation({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return null;

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (!user) return null;

        await ctx.db.patch(user._id, {
            isOnline: false,
            lastSeen: Date.now(),
        });
    },
});
