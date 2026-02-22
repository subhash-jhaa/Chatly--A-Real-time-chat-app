"use client";

import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { ReactNode } from "react";
import UserStoreProvider from "./UserStoreProvider";

const convex = new ConvexReactClient(
    process.env.NEXT_PUBLIC_CONVEX_URL as string
);

export default function ConvexClientProvider({
    children,
}: {
    children: ReactNode;
}) {
    return (
        <ClerkProvider
            publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY as string}
        >
            <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
                <UserStoreProvider>{children}</UserStoreProvider>
            </ConvexProviderWithClerk>
        </ClerkProvider>
    );
}
