"use client";

import { useMutation } from "convex/react";
import { useAuth } from "@clerk/nextjs";
import { useUser } from "@clerk/nextjs"; // ← add this
import { api } from "../../../convex/_generated/api";
import { useEffect } from "react";
import { usePresence } from "@/hooks/usePresence";

export default function UserStoreProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const storeUser = useMutation(api.users.store);
    const { isLoaded, isSignedIn } = useAuth();
    const { user } = useUser(); // <- add this — gives us live Clerk user data

    useEffect(() => {
        // Wait for Clerk to fully load AND confirm the user is signed in
        // This prevents calling the mutation on auth pages or during initial load
        if (isLoaded && isSignedIn) {
            storeUser().catch((err) =>
                console.error("Failed to store user:", err)
            );
        }
    }, [
        isLoaded,
        isSignedIn,
        storeUser,
        user?.fullName,    // ← re-run when name changes
        user?.imageUrl,    // ← re-run when avatar changes
    ]);

    usePresence();

    return <>{children}</>;
}