/**
 * ConversationSkeleton — Loading placeholder for the conversation sidebar.
 * No props — always renders 5 skeleton rows.
 *
 * Skeleton matches the exact height and layout of ConversationItem so the
 * UI doesn't "jump" when data loads. Each row mirrors:
 *   - 44px circle (avatar)
 *   - Two lines of text (name + message preview)
 * This technique is called a "content placeholder" or "skeleton screen"
 * and is used by Facebook, LinkedIn, YouTube, etc. to reduce perceived load time.
 */

"use client";

export default function ConversationSkeleton() {
    return (
        <div className="flex flex-col gap-1 p-3">
            {/* 5 skeleton rows — matches the typical above-the-fold count */}
            {Array.from({ length: 5 }).map((_, index) => (
                <div
                    key={index}
                    className="flex items-center gap-3 rounded-lg px-3 py-3"
                // px-3 py-3: matches ConversationItem's exact padding
                >
                    {/* Avatar skeleton — 44px circle matches the real avatar size */}
                    <div className="h-11 w-11 flex-shrink-0 animate-pulse rounded-full bg-gray-700/50" />

                    {/* Text content skeleton */}
                    <div className="flex-1">
                        {/* Name skeleton — shorter width to look realistic */}
                        <div className="mb-2 h-3.5 w-24 animate-pulse rounded bg-gray-700/50" />

                        {/* Message preview skeleton — wider to mimic a sentence */}
                        <div className="h-3 w-40 animate-pulse rounded bg-gray-700/40" />
                    </div>

                    {/* Timestamp skeleton — small on the right side */}
                    <div className="h-3 w-10 flex-shrink-0 animate-pulse rounded bg-gray-700/30" />
                </div>
            ))}
        </div>
    );
}
