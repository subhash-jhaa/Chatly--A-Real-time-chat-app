/**
 * TypingIndicator — Shows who is currently typing in a conversation.
 * Props: conversationId to subscribe to typing status for that conversation.
 *
 * Subscribes to getTyping via Convex's useQuery — this is a LIVE subscription,
 * so the indicator appears/disappears in real-time as other users type.
 *
 * ANIMATION: Three bouncing dots with staggered animation-delay (0ms, 150ms, 300ms).
 * Staggered delays create the wave effect — purely CSS, no JS animation needed.
 * This is the same pattern used by iMessage, Slack, and Instagram DMs.
 */

"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";

interface TypingIndicatorProps {
    conversationId: Id<"conversations">;
}

export default function TypingIndicator({ conversationId }: TypingIndicatorProps) {
    // Real-time subscription — Convex pushes updates when typing status changes
    const typingUsers = useQuery(api.typing.getTyping, { conversationId });

    // Don't render anything if nobody is typing (or still loading)
    if (!typingUsers || typingUsers.length === 0) {
        return null;
    }

    // Build the display text: "Alice is typing" or "Alice and Bob are typing"
    const typingText =
        typingUsers.length === 1
            ? `${typingUsers[0]} is typing`
            : `${typingUsers.join(" and ")} are typing`;

    return (
        <div className="flex items-center gap-2 px-6 py-2">
            {/* Typing text — shows who is typing */}
            <span className="text-xs text-zinc-400">{typingText}</span>

            {/* ===== Bouncing Dots Animation ===== */}
            {/* Three dots with staggered animation-delay create a wave effect */}
            {/* Each dot bounces with a slight delay after the previous one */}
            {/* This is purely CSS — no requestAnimationFrame or JS timers needed */}
            <span className="flex items-center gap-0.5">
                {/* Dot 1: starts immediately (0ms delay) */}
                <span
                    className="inline-block h-1 w-1 animate-bounce rounded-full bg-zinc-400"
                    style={{ animationDelay: "0ms" }}
                />
                {/* Dot 2: starts 150ms later — creates the "wave" illusion */}
                <span
                    className="inline-block h-1 w-1 animate-bounce rounded-full bg-zinc-400"
                    style={{ animationDelay: "150ms" }}
                />
                {/* Dot 3: starts 300ms later — completes the wave pattern */}
                <span
                    className="inline-block h-1 w-1 animate-bounce rounded-full bg-zinc-400"
                    style={{ animationDelay: "300ms" }}
                />
            </span>
        </div>
    );
}
