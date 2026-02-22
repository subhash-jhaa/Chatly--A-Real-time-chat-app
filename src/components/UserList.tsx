/**
 * UserList Component
 *
 * This component renders a searchable list of all users in the app (excluding
 * the currently logged-in user). It's the left sidebar of our chat app — similar
 * to WhatsApp's contact list.
 *
 * DATA FLOW:
 * - Fetches all users via Convex's `useQuery(api.users.getAll)` — this is a
 *   REAL-TIME SUBSCRIPTION, not a one-time fetch. Whenever a new user signs up
 *   or a user's data changes in the database, this component automatically
 *   re-renders with fresh data. No manual refetching or polling needed.
 *
 * - Accepts `onSelectUser` callback prop — when a user clicks on a contact,
 *   we call this function with the selected user's Convex document ID.
 *   The parent component uses this to open the conversation with that user.
 *
 * OUTPUT: A vertical list of user rows with avatars, names, and online status
 *         indicators, plus a search bar for filtering.
 */

"use client"; // Required because we use React hooks (useState) and Convex hooks (useQuery)

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";
import { Search } from "lucide-react";
import { Id } from "../../convex/_generated/dataModel";
import Image from "next/image";
import EmptyState from "./ui/EmptyState";
import OnlineIndicator from "./ui/OnlineIndicator";

// ─── Props Interface ──────────────────────────────────────────────────────────
// We define this separately for clarity — the parent component passes in a
// callback function that receives the selected user's Convex document ID.
interface UserListProps {
    onSelectUser: (userId: Id<"users">) => void;
}

export default function UserList({ onSelectUser }: UserListProps) {
    // ─── State ────────────────────────────────────────────────────────────────
    // searchQuery holds the current value of the search input.
    // We use descriptive naming: `searchQuery` instead of `q` or `input`
    const [searchQuery, setSearchQuery] = useState("");

    // ─── Data Fetching (Real-Time Subscription) ───────────────────────────────
    //
    // useQuery() from Convex is NOT like a traditional fetch/axios call.
    // Under the hood, it opens a WebSocket connection to the Convex backend
    // and subscribes to the query. This means:
    //
    //   1. On first render → it fetches the data (returns undefined while loading)
    //   2. Whenever the underlying data changes → Convex pushes the update
    //      through the WebSocket, and React re-renders automatically
    //   3. When the component unmounts → the subscription is cleaned up
    //
    // This is what makes Convex "real-time" — no need for setInterval,
    // polling, or manual refetch logic like you'd use with React Query.
    const allUsers = useQuery(api.users.getAll);

    // ─── Client-Side Filtering Logic ──────────────────────────────────────────
    //
    // WHY WE FILTER CLIENT-SIDE instead of creating a new Convex query:
    //
    // 1. PERFORMANCE: The user list is typically small (tens to hundreds of users).
    //    Filtering in the browser is instant — no network round-trip needed.
    //    Making a new Convex query on every keystroke would create unnecessary
    //    server load and introduce latency on each character typed.
    //
    // 2. UX SMOOTHNESS: Client-side filtering gives instant results as the user
    //    types. A server query would show a loading spinner on every keystroke,
    //    creating a janky experience.
    //
    // 3. DATA IS ALREADY HERE: Since useQuery already fetched all users into
    //    memory, filtering them locally is essentially free. We'd only consider
    //    server-side search if the user list was very large (thousands+).
    //
    // If this were a large-scale app with 10,000+ users, we'd use Convex's
    // search indexes with a debounced server query instead.
    const filteredUsers = allUsers?.filter((user) =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // ─── Loading State ────────────────────────────────────────────────────────
    // Convex useQuery returns undefined while loading and null if the query
    // has no results — we handle both states explicitly
    if (allUsers === undefined) {
        return (
            <div className="flex flex-col gap-2 p-3">
                {/* Search bar skeleton */}
                <div className="h-10 animate-pulse rounded-lg bg-gray-700/50" />

                {/* 5 user row skeletons — mimics the layout of real user rows */}
                {Array.from({ length: 5 }).map((_, index) => (
                    <div
                        key={index}
                        className="flex items-center gap-3 rounded-lg p-3"
                    >
                        <div className="h-10 w-10 animate-pulse rounded-full bg-gray-700/50" />
                        <div className="h-4 w-32 animate-pulse rounded bg-gray-700/50" />
                    </div>
                ))}
            </div>
        );
    }

    // ─── Empty User List State ────────────────────────────────────────────────
    // If there are no other users in the database at all (not a search result
    // issue, but genuinely no users), show a helpful message.
    if (allUsers.length === 0) {
        return (
            <EmptyState
                icon="👥"
                title="No other users yet"
                description="You're the first one here! Invite friends to start chatting."
            />
        );
    }

    // ─── Main Render ──────────────────────────────────────────────────────────
    return (
        <div className="flex h-full flex-col">
            {/* ===== Search Input ===== */}
            <div className="p-3">
                <div className="relative">
                    {/* Search icon positioned inside the input for a polished look */}
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />

                    <input
                        type="text"
                        placeholder="Search users..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full rounded-lg border border-gray-700 bg-gray-800/50 py-2 pl-10 pr-4 text-sm text-white placeholder-zinc-500 outline-none transition-colors focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                    // pl-10: left padding to make room for the search icon
                    // focus:border-cyan-500: visual feedback when input is focused
                    />
                </div>
            </div>

            {/* ===== User List ===== */}
            <div className="flex-1 overflow-y-auto px-3 pb-3">
                {/* Empty Search Results State */}
                {filteredUsers && filteredUsers.length === 0 ? (
                    <EmptyState
                        icon="🔍"
                        title="No users found"
                        description="Try a different search term"
                    />
                ) : (
                    // Render each user as a clickable row
                    <div className="flex flex-col gap-1">
                        {filteredUsers?.map((user) => (
                            <div
                                key={user._id}
                                onClick={() => onSelectUser(user._id)}
                                className="flex cursor-pointer items-center gap-3 rounded-lg p-3 transition-colors hover:bg-gray-700/50"
                            // cursor-pointer: indicates the row is clickable
                            // hover:bg-gray-700/50: subtle highlight on hover for feedback
                            // transition-colors: smooth color transition instead of abrupt change
                            >
                                {/* ===== Avatar ===== */}
                                <div className="relative">
                                    {user.imageUrl ? (
                                        // If the user has a profile image (from Google, GitHub, etc.)
                                        // we render it as a circular avatar
                                        // Next.js Image automatically optimizes format (WebP),
                                        // applies lazy loading, and prevents layout shift with
                                        // explicit width/height — unlike raw <img> tags.
                                        <Image
                                            src={user.imageUrl}
                                            alt={user.name}
                                            width={40}
                                            height={40}
                                            className="h-10 w-10 rounded-full object-cover"
                                        />
                                    ) : (
                                        // FALLBACK: If no image URL exists, show the first letter
                                        // of their name in a colored circle. This is a common
                                        // pattern used by Gmail, Slack, Discord, etc.
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-600 text-sm font-semibold text-white">
                                            {user.name.charAt(0).toUpperCase()}
                                        </div>
                                    )}

                                    {/* Online/Offline indicator — now wired to real presence data */}
                                    <span className="absolute bottom-0 right-0 rounded-full border-2 border-[#1a1d27]">
                                        <OnlineIndicator isOnline={user.isOnline} size="md" />
                                    </span>
                                </div>

                                {/* ===== User Info ===== */}
                                <div className="flex-1 overflow-hidden">
                                    <p className="truncate text-sm font-medium text-white">
                                        {user.name}
                                    </p>
                                    {/* truncate: prevents long names from breaking the layout
                                        by adding "..." at the end */}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
