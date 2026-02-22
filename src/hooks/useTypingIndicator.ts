/**
 * useTypingIndicator — Custom hook for managing outgoing typing indicators.
 *
 * WHY THIS IS A HOOK:
 * Typing indicator logic involves debouncing, refs, and mutations — it's complex
 * enough to deserve its own hook. Keeping it out of MessageInput means:
 *   1. MessageInput stays a pure "dumb" input component
 *   2. The debounce logic is testable in isolation
 *   3. Easy to explain in an interview: "all typing logic is encapsulated here"
 *
 * DEBOUNCE PATTERN (Classic Interview Topic):
 * The problem: we need to show a "typing" indicator when the user is actively
 * typing, and clear it when they stop. But we can't fire a "stopped typing"
 * event on every keystroke — we need to wait for a PAUSE in typing.
 *
 * The solution: on each keystroke, we:
 *   1. Call setTyping immediately (so the other user sees "typing..." right away)
 *   2. Reset a 2-second timer
 *   3. Only when the user PAUSES for 2 full seconds does the timer fire clearTyping
 *
 * Each keystroke resets the 2-second timer. Only when the user pauses for
 * 2 full seconds do we mark them as stopped typing.
 *
 * WHY 2000ms:
 * - Too short (500ms): would flicker — the indicator would appear and disappear
 *   between normal typing pauses (thinking about the next word)
 * - Too long (5000ms): would show "typing..." long after the user stopped,
 *   making the indicator feel stale and untrustworthy
 * - 2000ms is the sweet spot used by Slack, Discord, and WhatsApp — it catches
 *   natural pauses without flickering
 */

"use client";

import { useRef, useCallback } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

// How long to wait after the last keystroke before clearing the typing indicator
const TYPING_TIMEOUT_MS = 2000;

export function useTypingIndicator(conversationId: Id<"conversations">) {
    const setTyping = useMutation(api.typing.setTyping);
    const clearTyping = useMutation(api.typing.clearTyping);

    // ─── Why useRef Instead of useState ──────────────────────────────────
    // We use useRef for the timeout ID because:
    //   1. Updating the timeout shouldn't cause a re-render — it's an internal
    //      implementation detail, not something the UI needs to react to
    //   2. useState would trigger a re-render on each keystroke just to update
    //      the timer reference, which is wasteful
    //   3. useRef gives us a mutable container that persists across renders
    //      without triggering re-renders when its value changes
    const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    /**
     * notifyTyping — Call this on each keystroke in the message input.
     *
     * Immediately tells the server "I'm typing", then sets/resets a timer
     * to clear the indicator after 2 seconds of inactivity.
     *
     * useCallback memoizes this function so it doesn't change on every render,
     * preventing unnecessary re-renders in child components that receive it as a prop.
     */
    const notifyTyping = useCallback(() => {
        // Step 1: Tell the server we're typing (fires immediately on first keystroke)
        setTyping({ conversationId }).catch(console.error);

        // Step 2: Clear any existing timeout — the user is STILL typing
        // Without this, the previous timeout would fire clearTyping too early
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        // Step 3: Set a NEW 2-second timeout
        // This timer only fires if the user doesn't type for 2 full seconds
        // Each keystroke resets this timer, so rapid typing keeps the indicator alive
        typingTimeoutRef.current = setTimeout(() => {
            clearTyping({ conversationId }).catch(console.error);
            typingTimeoutRef.current = null;
        }, TYPING_TIMEOUT_MS);
    }, [conversationId, setTyping, clearTyping]);

    /**
     * notifyStopped — Immediately clears the typing indicator.
     *
     * Called when the user sends a message — we want the "typing" indicator
     * to disappear INSTANTLY when a message appears, not after the 2-second delay.
     */
    const notifyStopped = useCallback(() => {
        // Cancel any pending timeout — the message was sent, no need to wait
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = null;
        }

        // Immediately tell the server we stopped typing
        clearTyping({ conversationId }).catch(console.error);
    }, [conversationId, clearTyping]);

    return { notifyTyping, notifyStopped };
}
