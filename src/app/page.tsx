"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import SplashScreen from "@/components/SplashScreen";

export default function RootPage() {
    const [showSplash, setShowSplash] = useState(true);
    const { isSignedIn, isLoaded } = useAuth();
    const router = useRouter();

    const handleSplashComplete = () => {
        setShowSplash(false);

        if (!isLoaded) return;

        if (isSignedIn) {
            router.replace("/conversations");
        } else {
            router.replace("/sign-in");
        }
    };

    if (showSplash) {
        return <SplashScreen onComplete={handleSplashComplete} />;
    }

    return null;
}
