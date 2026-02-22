/**
 * useIsMobile — Custom hook to detect if the viewport is mobile-sized.
 *
 * Used sparingly — prefer CSS responsive classes (e.g., `hidden md:flex`).
 * This hook is only needed when we must CONDITIONALLY RENDER entire components,
 * not just style them differently. CSS can show/hide elements, but it can't
 * prevent a component from mounting and running its hooks/effects.
 *
 * WHY WE DON'T USE THIS FOR THE SIDEBAR:
 * The sidebar uses `hidden md:flex` in CSS, which is better because:
 *   1. CSS-based show/hide doesn't cause React re-renders
 *   2. The sidebar keeps its state even when hidden (conversation list, scroll position)
 *   3. CSS media queries are evaluated by the browser, not JavaScript —
 *      they work during SSR hydration without flash-of-wrong-content
 * This hook causes a re-render when the window resizes, so we only use it
 * when there's no CSS alternative (e.g., conditionally rendering a component
 * that would otherwise waste resources when hidden).
 */

"use client";

import { useState, useEffect } from "react";

// Tailwind's `md` breakpoint is 768px — we match it here for consistency
const MOBILE_BREAKPOINT = 768;

export function useIsMobile(): boolean {
    // Default to false (desktop) to match server-side rendering
    // On the server, window doesn't exist, so we assume desktop
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        // Check the current viewport width and update state
        const checkIsMobile = () => {
            setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
        };

        // Run once immediately to set the correct initial value
        checkIsMobile();

        // Listen for window resize events to keep the value updated
        // This fires when the user resizes their browser or rotates their device
        window.addEventListener("resize", checkIsMobile);

        // Cleanup: remove the listener when the component unmounts
        // Without this, we'd have a memory leak — the listener would keep
        // firing even after the component is gone
        return () => window.removeEventListener("resize", checkIsMobile);
    }, []);

    return isMobile;
}
