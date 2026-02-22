"use client";

import { useMutation } from "convex/react";
import { useAuth } from "@clerk/nextjs";
import { api } from "../../../convex/_generated/api";
import { useEffect } from "react";
import { usePresence } from "@/hooks/usePresence";

export default function UserStoreProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const storeUser = useMutation(api.users.store);

    // isLoaded tells us if Clerk has finished loading the auth state
    // isSignedIn tells us if the user is actually signed in
    // We need BOTH to be true before calling the mutation
    const { isLoaded, isSignedIn } = useAuth();

    useEffect(() => {
        // Wait for Clerk to fully load AND confirm the user is signed in
        // This prevents calling the mutation on auth pages or during initial load
        if (isLoaded && isSignedIn) {
            storeUser().catch((err) =>
                console.error("Failed to store user:", err)
            );
        }
    }, [isLoaded, isSignedIn, storeUser]);

    // ─── Presence Tracking ────────────────────────────────────────────────
    // usePresence handles online/offline status via visibilitychange,
    // beforeunload, and mount/unmount lifecycle. It lives here because
    // UserStoreProvider wraps the entire authenticated app — presence
    // tracking activates once and stays active for the user's session.
    usePresence();

    return <>{children}</>;
}
