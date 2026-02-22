/**
 * ConversationList — Renders all conversations the current user is part of.
 * No props — fetches data directly via Convex's useQuery subscription.
 *
 * useQuery here is a LIVE SUBSCRIPTION — the sidebar updates automatically
 * when a new message arrives in any conversation, or when a new conversation
 * is created. No manual refetch, no polling, no "pull to refresh".
 * This is what makes the sidebar feel "live" and responsive.
 *
 * SEARCH: Toggled via the search icon in the header. When open, filters
 * conversations client-side by the other user's name. We don't need a
 * separate server query because the full conversation list is already
 * loaded — filtering a small array in memory is instant.
 */

"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { usePathname } from "next/navigation";
import { Search, X } from "lucide-react";
import ConversationItem from "./ConversationItem";
import ConversationSkeleton from "../ui/ConversationSkeleton";
import EmptyState from "../ui/EmptyState";

export default function ConversationList() {
    // ─── Search State ─────────────────────────────────────────────────────
    // isSearchOpen: toggles the search input visibility
    // searchQuery: the actual filter text, cleared when search is closed
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Auto-focus the search input when it opens — so the user can
    // start typing immediately without an extra click
    useEffect(() => {
        if (isSearchOpen && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [isSearchOpen]);

    // ─── Real-Time Data Subscription ──────────────────────────────────────
    const conversations = useQuery(api.conversations.getAll);
    const pathname = usePathname();

    // ─── Loading State ────────────────────────────────────────────────────
    if (conversations === undefined) {
        return <ConversationSkeleton />;
    }

    // ─── Filter Conversations by Search Query ─────────────────────────────
    // Case-insensitive match on the other user's name.
    // We filter the already-fetched array — no server call needed.
    const filteredConversations = conversations.filter(({ otherUser }) => {
        if (!otherUser) return false;
        if (!searchQuery.trim()) return true;
        return otherUser.name.toLowerCase().includes(searchQuery.toLowerCase());
    });

    // Close search and clear the query
    const handleCloseSearch = () => {
        setIsSearchOpen(false);
        setSearchQuery("");
    };

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
        <div className="flex flex-1 flex-col overflow-hidden">
            {/* ===== Header: "Chats" title + Search icon ===== */}
            {/* The search icon toggles the search input below */}
            <div className="flex items-center justify-between px-4 pb-2 pt-1">
                <h2 className="text-sm font-semibold text-zinc-300">Chats</h2>
                <button
                    onClick={() => setIsSearchOpen(!isSearchOpen)}
                    className="flex h-7 w-7 items-center justify-center rounded-full transition-colors hover:bg-gray-700/50"
                    title="Search conversations"
                >
                    <Search className="h-4 w-4 text-zinc-400" />
                </button>
            </div>

            {/* ===== Collapsible Search Input ===== */}
            {/* Only rendered when the search icon is clicked. */}
            {/* Auto-focuses so the user can start typing immediately. */}
            {isSearchOpen && (
                <div className="px-3 pb-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                        <input
                            ref={searchInputRef}
                            type="text"
                            placeholder="Search by name..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full rounded-lg border border-gray-700 bg-[#0f1117] py-2 pl-9 pr-8 text-sm text-white placeholder-zinc-500 outline-none transition-colors focus:border-purple-500"
                        />
                        {/* Close button — collapses search and clears the query */}
                        <button
                            onClick={handleCloseSearch}
                            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-zinc-400 hover:text-white"
                        >
                            <X className="h-3.5 w-3.5" />
                        </button>
                    </div>
                </div>
            )}

            {/* ===== Conversation Items ===== */}
            <div className="flex-1 overflow-y-auto px-2 pb-2">
                <div className="flex flex-col gap-1">
                    {filteredConversations.length === 0 ? (
                        <p className="py-8 text-center text-xs text-zinc-500">
                            No conversations found
                        </p>
                    ) : (
                        filteredConversations.map(({ conversation, otherUser, lastMessage, unreadCount }) => {
                            if (!otherUser) return null;

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
                        })
                    )}
                </div>
            </div>
        </div>
    );
}


