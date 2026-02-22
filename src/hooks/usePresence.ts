/**
 * usePresence — Custom hook that manages real-time online/offline presence.
 *
 * WHY THIS IS A HOOK AND NOT COMPONENT LOGIC:
 * Presence tracking involves multiple event listeners and cleanup logic.
 * Keeping it in a dedicated hook makes it:
 *   1. Testable independently of any component
 *   2. Reusable if we need presence in multiple places
 *   3. Easy to explain in an interview — "all presence logic is here"
 *
 * HOW IT WORKS:
 * - On mount → calls setOnline (user opened the app)
 * - On visibility change → online when tab is visible, offline when hidden
 * - On beforeunload → offline when the browser tab is about to close
 * - On unmount → calls setOffline (cleanup function)
 *
 * BROWSER EVENTS USED:
 * - `visibilitychange` → tab switching (most reliable cross-browser)
 * - `beforeunload` → tab/window closing (unreliable on mobile, see below)
 */

"use client";

import { useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useAuth } from "@clerk/nextjs";

export function usePresence() {
    const setOnline = useMutation(api.users.setOnline);
    const setOffline = useMutation(api.users.setOffline);
    const { isLoaded, isSignedIn } = useAuth();

    useEffect(() => {
        // Don't set up presence until auth is fully loaded and user is signed in
        if (!isLoaded || !isSignedIn) return;

        // ─── 1. Mark user online when they open the app ──────────────────
        // This runs immediately on mount — the user just arrived
        setOnline().catch(console.error);

        // ─── 2. Handle tab visibility changes ────────────────────────────
        // The `visibilitychange` event fires when the user switches tabs.
        // document.visibilityState will be:
        //   - "hidden" → user switched to another tab or minimized the browser
        //   - "visible" → user came back to our tab
        // This is the MOST RELIABLE way to detect if the user is actively
        // looking at our app across all modern browsers.
        const handleVisibilityChange = () => {
            if (document.visibilityState === "visible") {
                // User returned to our tab — mark them online
                setOnline().catch(console.error);
            } else {
                // User left our tab — mark them offline
                setOffline().catch(console.error);
            }
        };

        // ─── 3. Handle browser/tab close ─────────────────────────────────
        // The `beforeunload` event fires right before the browser tab closes.
        // We use it to send a final "I'm offline" signal to the server.
        //
        // WHY beforeunload IS UNRELIABLE ON MOBILE:
        // On iOS Safari and some Android browsers, `beforeunload` does NOT fire
        // when the user swipes the app away or switches apps. Mobile browsers
        // often "freeze" tabs instead of closing them, so this event never triggers.
        //
        // FALLBACK STRATEGY:
        // We rely on `visibilitychange` as the primary presence signal (it works
        // on mobile). Additionally, the `lastSeen` timestamp acts as a server-side
        // fallback — if lastSeen is older than a timeout threshold (e.g., 5 minutes),
        // we can consider the user offline regardless of isOnline status.
        // This could be implemented with a Convex cron job in the future.
        const handleBeforeUnload = () => {
            // Using the mutation directly — no need to await since the page is closing
            setOffline().catch(console.error);
        };

        // ─── Register Event Listeners ────────────────────────────────────
        // We add listeners to the document and window objects to track presence
        document.addEventListener("visibilitychange", handleVisibilityChange);
        window.addEventListener("beforeunload", handleBeforeUnload);

        // ─── Cleanup Function ────────────────────────────────────────────
        // This runs when the component unmounts (useEffect cleanup).
        // Component unmount = user navigated away from the app or the provider
        // was removed from the tree.
        //
        // We MUST remove the event listeners to prevent memory leaks.
        // Without cleanup:
        //   1. The old listeners would still fire even after the component is gone
        //   2. Each re-mount would add ANOTHER set of listeners (listener leak)
        //   3. The setOnline/setOffline mutations would reference stale closures
        return () => {
            // Mark user offline on unmount
            setOffline().catch(console.error);

            // Remove all event listeners to prevent memory leaks
            document.removeEventListener("visibilitychange", handleVisibilityChange);
            window.removeEventListener("beforeunload", handleBeforeUnload);
        };
    }, [isLoaded, isSignedIn, setOnline, setOffline]);
}
