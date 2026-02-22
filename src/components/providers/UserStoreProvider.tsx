"use client";

import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useEffect } from "react";

export default function UserStoreProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const storeUser = useMutation(api.users.store);

    useEffect(() => {
        storeUser().catch((err) =>
            console.error("Failed to store user:", err)
        );
    }, [storeUser]);

    return <>{children}</>;
}
