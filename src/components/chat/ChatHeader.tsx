/**
 * ChatHeader — Displays who you're chatting with at the top of the conversation.
 * Props: otherUser (name, imageUrl, isOnline) for the other participant.
 *
 * Purely presentational — just displays who you're talking to.
 * No state, no side effects, no data fetching. This makes it easy to
 * test, reuse, and explain in an interview.
 *
 * RESPONSIVE BEHAVIOR:
 * On mobile, a back arrow appears to let users return to the conversation list.
 * The back button is IN the header (not a separate component) because it's
 * visually part of the header on mobile — placing it elsewhere would break
 * the visual flow and require extra layout calculations.
 * On desktop (md+), the back button is hidden because the sidebar is always visible.
 */

"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import OnlineIndicator from "../ui/OnlineIndicator";

interface ChatHeaderProps {
    otherUser: {
        name: string;
        imageUrl: string;
        isOnline: boolean;
    };
}

export default function ChatHeader({ otherUser }: ChatHeaderProps) {
    const router = useRouter();

    return (
        <div className="flex items-center gap-3 border-b border-gray-700 bg-[#1a1d27] px-4 py-3 md:px-6">
            {/* px-4 on mobile (tighter), md:px-6 on desktop (more breathing room) */}

            {/* ===== Mobile Back Button ===== */}
            {/* md:hidden: only visible on mobile — on desktop the sidebar handles navigation */}
            {/* On mobile the back button replaces the always-visible sidebar. */}
            {/* On desktop both sidebar and chat are visible simultaneously */}
            <button
                onClick={() => router.push("/")}
                className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-gray-700/50 md:hidden"
            // md:hidden: CSS-based hiding — no JS needed, no re-render on resize
            // We use router.push("/") instead of router.back() so the user
            // always lands on the conversation list, not an unpredictable history entry
            >
                <ArrowLeft className="h-5 w-5 text-zinc-400" />
            </button>

            {/* ===== Avatar ===== */}
            <div className="relative">
                {otherUser.imageUrl ? (
                    // Next.js Image automatically optimizes format (WebP),
                    // applies lazy loading, and prevents layout shift with
                    // explicit width/height — unlike raw <img> tags.
                    <Image
                        src={otherUser.imageUrl}
                        alt={otherUser.name}
                        width={40}
                        height={40}
                        className="h-10 w-10 rounded-full object-cover"
                    />
                ) : (
                    // Fallback: first letter of name in a colored circle
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-600 text-sm font-semibold text-white">
                        {otherUser.name.charAt(0).toUpperCase()}
                    </div>
                )}

                {/* Online/Offline indicator — uses shared OnlineIndicator */}
                {/* "lg" size since the header has more visual space */}
                <span className="absolute bottom-0 right-0 rounded-full border-2 border-[#1a1d27]">
                    <OnlineIndicator isOnline={otherUser.isOnline} size="lg" />
                </span>
            </div>

            {/* ===== Name + Status ===== */}
            <div>
                <h2 className="text-sm font-semibold text-white">
                    {otherUser.name}
                </h2>
                <p className="text-xs text-zinc-400">
                    {otherUser.isOnline ? "Online" : "Offline"}
                </p>
            </div>
        </div>
    );
}
