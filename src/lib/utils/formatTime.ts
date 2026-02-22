/**
 * Time Formatting Utilities
 *
 * These functions format Unix timestamps (milliseconds since Jan 1, 1970)
 * into human-readable strings throughout the chat app.
 *
 * WHY UNIX TIMESTAMPS (number) INSTEAD OF Date OBJECTS:
 * Convex stores timestamps as plain numbers (Date.now()) because:
 *   1. Numbers are serializable — they can travel over the network as JSON
 *   2. Date objects can't be stored directly in a database
 *   3. Numbers are timezone-agnostic — we format them on the client
 *      in the user's local timezone, not the server's timezone
 *
 * WHY date-fns OVER NATIVE Date:
 * date-fns is tree-shakeable — we only import the functions we use, so the
 * bundle stays small (~2KB for these 3 functions vs ~70KB for moment.js).
 * It also handles edge cases like locale formatting reliably, and its
 * function-per-import pattern makes dependencies explicit and readable.
 *
 * THREE FORMATTING RULES:
 * 1. Today → time only: "2:34 PM" (saves space for most common case)
 * 2. This year → "Feb 15, 2:34 PM" (context without being verbose)
 * 3. Different year → "Feb 15 2023, 2:34 PM" (unambiguous for old messages)
 */

import { isToday, isThisYear, isYesterday, format } from "date-fns";

// ─── Helper Functions ─────────────────────────────────────────────────────
// Breaking logic into small named functions keeps each one testable
// and avoids deeply nested ternary expressions.

/**
 * formatTimeOnly — Returns just the time portion: "2:34 PM"
 * Used when the date is obvious (i.e., today).
 */
function formatTimeOnly(date: Date): string {
    return format(date, "h:mm a"); // e.g., "2:34 PM"
}

/**
 * formatDateWithTime — Returns month + day + time: "Feb 15, 2:34 PM"
 * Used when the message is from this year but not today.
 */
function formatDateWithTime(date: Date): string {
    return format(date, "MMM d, h:mm a"); // e.g., "Feb 15, 2:34 PM"
}

/**
 * formatFullDateWithTime — Returns month + day + year + time: "Feb 15 2023, 2:34 PM"
 * Used for messages from a different year — year is needed for clarity.
 */
function formatFullDateWithTime(date: Date): string {
    return format(date, "MMM d yyyy, h:mm a"); // e.g., "Feb 15 2023, 2:34 PM"
}

// ─── Exported Formatting Functions ────────────────────────────────────────

/**
 * formatMessageTime — Formats a message timestamp for display.
 *
 * @param timestamp - Unix timestamp in milliseconds (from Date.now())
 * @returns A human-readable time string based on the 3 rules above
 *
 * Used in: MessageBubble (per-message timestamp) and ConversationItem (sidebar preview)
 */
export function formatMessageTime(timestamp: number): string {
    const date = new Date(timestamp);

    // Rule 1: If today → return time only: "2:34 PM"
    // Most common case — saves space since the user knows it's today
    if (isToday(date)) {
        return formatTimeOnly(date);
    }

    // Rule 2: If this year but not today → return "Feb 15, 2:34 PM"
    // Gives context without being verbose — no need for the year
    if (isThisYear(date)) {
        return formatDateWithTime(date);
    }

    // Rule 3: Different year → return "Feb 15 2023, 2:34 PM"
    // Year is needed so historical messages are unambiguous
    return formatFullDateWithTime(date);
}

/**
 * getDateDividerLabel — Returns a label for date separators between messages.
 *
 * Used to render date separator labels between messages from different days.
 * For example, if you scroll through a conversation, you'll see:
 *   ── Today ──
 *   ── Yesterday ──
 *   ── Feb 15 ──
 *
 * @param timestamp - Unix timestamp in milliseconds
 * @returns "Today", "Yesterday", or a formatted date like "Feb 15"
 */
export function getDateDividerLabel(timestamp: number): string {
    const date = new Date(timestamp);

    if (isToday(date)) {
        return "Today";
    }

    if (isYesterday(date)) {
        return "Yesterday";
    }

    // For older dates, show "Feb 15" or "Feb 15, 2023" if different year
    if (isThisYear(date)) {
        return format(date, "MMM d"); // e.g., "Feb 15"
    }

    return format(date, "MMM d, yyyy"); // e.g., "Feb 15, 2023"
}
