/**
 * MessageSkeleton — Loading placeholder for the message list area.
 * No props — always renders 6 skeleton message bubbles.
 *
 * Alternating sides (left/right) makes it feel realistic and gives users
 * a sense of the incoming layout — they can see that this is a two-person
 * conversation even before the real data loads. This reduces perceived
 * wait time because the user's brain starts "reading" the structure.
 */

"use client";

export default function MessageSkeleton() {
    // Define which bubbles go on which side
    // true = right side (my message), false = left side (their message)
    // Alternating pattern mimics a real back-and-forth conversation
    const bubblePattern = [false, true, false, false, true, true];

    return (
        <div className="flex flex-1 flex-col gap-4 p-4">
            {bubblePattern.map((isRight, index) => (
                <div
                    key={index}
                    className={`flex items-end gap-2 ${isRight ? "justify-end" : "justify-start"
                        }`}
                >
                    {/* Avatar skeleton — only on the left side (other person's messages) */}
                    {!isRight && (
                        <div className="h-7 w-7 flex-shrink-0 animate-pulse rounded-full bg-gray-700/40" />
                    )}

                    {/* Message bubble skeleton — varying widths for realism */}
                    <div
                        className={`animate-pulse rounded-2xl px-4 py-3 ${isRight
                                ? "rounded-br-sm bg-purple-600/20"
                                : "rounded-bl-sm bg-gray-700/30"
                            }`}
                        style={{
                            // Varying widths make skeletons look like messages
                            // of different lengths — more realistic than uniform blocks
                            width: `${120 + (index % 3) * 60}px`,
                            height: `${36 + (index % 2) * 16}px`,
                        }}
                    />
                </div>
            ))}
        </div>
    );
}
