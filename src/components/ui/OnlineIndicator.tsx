/**
 * OnlineIndicator — A reusable green/gray dot showing online/offline status.
 * Props: isOnline (boolean), optional size ("sm" | "md" | "lg").
 *
 * WHY THIS IS ITS OWN COMPONENT:
 * The online indicator appears in 3+ places (ChatHeader, ConversationItem, UserList).
 * Extracting it into a shared component ensures:
 *   1. Consistent sizing, colors, and animation across the app
 *   2. Single place to update if we change the design (e.g., add a yellow "away" state)
 *   3. Interview-friendly — shows the DRY principle in action
 *
 * ANIMATION CHOICE:
 * Pulse animation (animate-ping) draws attention to online status without being
 * distracting. The ping is layered BEHIND the solid dot using absolute positioning,
 * creating a subtle "breathing" effect similar to Apple's iMessage indicator.
 */

"use client";

interface OnlineIndicatorProps {
    isOnline: boolean;
    // Size variants for different contexts:
    //   "sm" (8px) → inside tight spaces like message bubbles
    //   "md" (10px) → default, used in sidebar conversation rows
    //   "lg" (12px) → chat header where there's more space
    size?: "sm" | "md" | "lg";
}

// Size mapping — Tailwind classes for each variant
const sizeClasses = {
    sm: "h-2 w-2",       // 8px — compact
    md: "h-2.5 w-2.5",   // 10px — default
    lg: "h-3 w-3",       // 12px — prominent
};

export default function OnlineIndicator({ isOnline, size = "md" }: OnlineIndicatorProps) {
    const dotSize = sizeClasses[size];

    return (
        // relative container — holds both the ping animation and the solid dot
        <span className="relative flex">
            {/* Ping animation layer — only renders when online */}
            {/* animate-ping: creates an expanding + fading ring effect */}
            {/* absolute: layers behind the solid dot */}
            {/* opacity-75: makes the ping semi-transparent so it fades naturally */}
            {isOnline && (
                <span
                    className={`absolute inline-flex ${dotSize} animate-ping rounded-full bg-green-400 opacity-75`}
                />
            )}

            {/* Solid dot — always visible */}
            {/* Green when online, gray when offline */}
            <span
                className={`relative inline-flex ${dotSize} rounded-full ${isOnline ? "bg-green-500" : "bg-gray-500"
                    }`}
            />
        </span>
    );
}
