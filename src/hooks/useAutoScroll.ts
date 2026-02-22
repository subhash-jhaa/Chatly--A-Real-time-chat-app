/**
 * useAutoScroll — Custom hook for smart auto-scrolling in a message list.
 *
 * PROBLEM THIS SOLVES:
 * Naively scrolling to the bottom on every new message is bad UX — if a user
 * is scrolled up reading old messages, force-scrolling yanks them away from
 * what they're reading. Smart auto-scroll only scrolls when the user is
 * already at the bottom, and shows a "New messages" button otherwise.
 *
 * RETURNS:
 *   - containerRef: attach to the scrollable container
 *   - bottomRef: attach to an invisible div at the end of the message list
 *   - isAtBottom: whether the user is currently scrolled to the bottom
 *   - scrollToBottom: function to programmatically scroll to the bottom
 *   - hasNewMessages: true when new messages arrived while user was scrolled up
 *
 * INTERVIEW NOTES:
 *   Q: Why useRef instead of useState for isAtBottom?
 *   A: isAtBottom is read inside the scroll event handler callback. If we used
 *      useState, the callback would capture a stale value from when it was
 *      created — a classic closure bug. useRef always gives us the current
 *      value via .current, regardless of when the callback runs.
 *
 *   Q: What's the UX reason for not always auto-scrolling?
 *   A: If someone scrolls up to re-read an old message and a new message
 *      arrives, force-scrolling them to the bottom is disruptive and loses
 *      their place. The "New messages" button respects their intent while
 *      still notifying them.
 */

"use client";

import { useRef, useState, useEffect, useCallback } from "react";

interface UseAutoScrollOptions {
    // The messages array — when its length changes, we check scroll position
    // and decide whether to auto-scroll or show the "New messages" button
    messages: unknown[];
}

export function useAutoScroll({ messages }: UseAutoScrollOptions) {
    // ─── Section 1: Track Scroll Position ─────────────────────────────────
    //
    // We attach an onScroll listener to the container and compute whether
    // the user is "at the bottom" on every scroll event.

    const containerRef = useRef<HTMLDivElement>(null);
    const bottomRef = useRef<HTMLDivElement>(null);

    // Why useRef instead of useState for isAtBottom:
    // We read this value inside the useEffect callback that fires when messages
    // change. If it were useState, the useEffect would capture a stale closure
    // value from when the effect was created. useRef.current always points to
    // the latest value, so we always get the correct scroll position.
    const isAtBottomRef = useRef(true);

    const [hasNewMessages, setHasNewMessages] = useState(false);

    // Track whether this is the initial mount — we want to scroll instantly
    // on first render, not with a smooth animation
    const isInitialMount = useRef(true);

    /**
     * handleScroll — Fires on every scroll event in the message container.
     *
     * THE MATH:
     *   scrollTop    = how far the user has scrolled from the top (in px)
     *   clientHeight = the visible height of the container (viewport)
     *   scrollHeight = the total height of all content (including off-screen)
     *
     *   If scrollTop + clientHeight >= scrollHeight, the user is at the very bottom.
     *
     *   We add a 50px threshold because:
     *   - Pixel-perfect bottom detection is fragile (fractional pixels, zoom levels)
     *   - Users who are "close enough" to the bottom clearly intend to follow
     *     new messages — treating 50px away as "at bottom" avoids the jarring
     *     case where a new message pushes content just barely out of view
     */
    const handleScroll = useCallback(() => {
        const container = containerRef.current;
        if (!container) return;

        const { scrollTop, clientHeight, scrollHeight } = container;

        // 50px threshold — we consider the user "at the bottom" even if they're
        // within 50px of the end. This accounts for sub-pixel rounding, zoom
        // levels, and the natural imprecision of scroll positions.
        isAtBottomRef.current = scrollTop + clientHeight >= scrollHeight - 50;

        // If the user manually scrolled to the bottom, clear the "new messages" banner
        // They've caught up, so the notification is no longer relevant
        if (isAtBottomRef.current) {
            setHasNewMessages(false);
        }
    }, []);

    // ─── Section 2: React to New Messages ─────────────────────────────────
    //
    // When the messages array changes (new message sent or received), we check
    // the user's current scroll position and decide:
    //   - If at bottom → auto-scroll smoothly to show the new message
    //   - If NOT at bottom → show "New messages" button (don't interrupt reading)
    //
    // We only auto-scroll if the user is already at the bottom. Forcing scroll
    // on a user reading old messages would be jarring and break their reading flow.
    useEffect(() => {
        if (messages.length === 0) return;

        if (isAtBottomRef.current) {
            // User is at the bottom — scroll to show the new message
            // Use smooth animation for subsequent messages (not initial load)
            if (isInitialMount.current) {
                // Section 4 — Initial scroll: instant on first load so users see
                // the latest messages immediately without a visible scroll animation
                bottomRef.current?.scrollIntoView({ behavior: "instant" });
                isInitialMount.current = false;
            } else {
                bottomRef.current?.scrollIntoView({ behavior: "smooth" });
            }
        } else {
            // User is scrolled up reading old messages — don't auto-scroll,
            // just notify them that new messages are available
            if (!isInitialMount.current) {
                setHasNewMessages(true);
            }
        }
    }, [messages]);

    // ─── Section 3: scrollToBottom Function ───────────────────────────────
    //
    // Programmatic scroll-to-bottom, called when the user clicks the
    // "New messages" button. Also clears the hasNewMessages flag since
    // the user has explicitly chosen to jump to the bottom.
    //
    // scrollIntoView is the cleanest cross-browser way to scroll to a
    // specific element — it works in all modern browsers and handles
    // edge cases like overflow containers automatically.
    const scrollToBottom = useCallback(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
        setHasNewMessages(false);
    }, []);

    return {
        containerRef,
        bottomRef,
        isAtBottom: isAtBottomRef.current,
        scrollToBottom,
        hasNewMessages,
        handleScroll,
    };
}
