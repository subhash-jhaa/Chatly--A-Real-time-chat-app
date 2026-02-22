/**
 * EmptyState — A reusable, generic empty state component.
 * Props: icon (emoji), title (string), description (string), optional action button.
 *
 * Generic empty state — reused across 4+ places in the app (ConversationList,
 * MessageList, UserList search results, UserList empty). The icon, title, and
 * description are all configurable so ONE component handles all scenarios.
 *
 * PROP DESIGN CHOICES:
 * - `icon` is a string (emoji) rather than a React component because emojis
 *   are simpler, need no imports, and look great at large sizes. If we needed
 *   custom SVG icons, we'd change this to `React.ReactNode`.
 * - `action` is optional because not every empty state needs a call-to-action.
 *   For example, "No messages yet" doesn't need a button, but "No conversations"
 *   might show a "Start Chatting" button.
 * - This component is "dumb" — zero business logic, just presentation.
 *   The parent decides WHAT to show, this component decides HOW to show it.
 */

"use client";

interface EmptyStateProps {
    icon: string;       // Emoji to display large, e.g., "💬" or "🔍"
    title: string;      // Bold heading, e.g., "No conversations yet"
    description: string; // Muted subtitle, e.g., "Search for someone to start chatting!"
    action?: {
        label: string;    // Button text, e.g., "Start a Chat"
        onClick: () => void;
    };
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
    return (
        <div className="flex h-full flex-col items-center justify-center gap-3 p-6">
            {/* Large emoji icon — draws the eye immediately */}
            <span className="text-5xl">{icon}</span>

            {/* Title — bold and prominent */}
            <h3 className="text-base font-semibold text-white">{title}</h3>

            {/* Description — muted for visual hierarchy */}
            <p className="max-w-[240px] text-center text-sm leading-relaxed text-zinc-500">
                {description}
            </p>

            {/* Optional action button — only renders if action prop is provided */}
            {action && (
                <button
                    onClick={action.onClick}
                    className="mt-2 rounded-lg bg-purple-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-purple-700"
                >
                    {action.label}
                </button>
            )}
        </div>
    );
}
