/**
 * MessageInput — The text input area for composing and sending messages.
 * Props: onSendMessage callback that receives the message content string.
 *
 * Handles the Enter/Shift+Enter keyboard behavior:
 *   - Enter = send message (most common action, should be fastest)
 *   - Shift+Enter = insert newline (for multi-line messages)
 * This matches the behavior users expect from Slack, Discord, and WhatsApp Web.
 *
 * TYPING INDICATOR INTEGRATION:
 * This component receives `notifyTyping` and `notifyStopped` callbacks from the
 * useTypingIndicator hook (injected by the parent page). It calls notifyTyping
 * on every keystroke and notifyStopped when a message is sent. The debounce
 * logic lives in the hook, NOT here — this keeps MessageInput focused on input.
 */

"use client";

import { useState, useRef, useEffect } from "react";
import { SendHorizontal } from "lucide-react";

interface MessageInputProps {
    onSendMessage: (content: string) => void;
    // Typing indicator callbacks — injected from the parent page's useTypingIndicator hook
    // These are optional so MessageInput can still work without typing indicators
    onTyping?: () => void;
    onStoppedTyping?: () => void;
}

export default function MessageInput({ onSendMessage, onTyping, onStoppedTyping }: MessageInputProps) {
    const [messageContent, setMessageContent] = useState("");
    const [isSending, setIsSending] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Auto-resize the textarea as the user types more lines
    // This creates a smooth expanding effect instead of a fixed-height box
    // with an ugly scrollbar appearing after 1 line
    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            // Reset height first so it can shrink when text is deleted
            textarea.style.height = "auto";
            // Set height to match content (scrollHeight = actual content height)
            // Cap at 150px to prevent the input from taking over the screen
            textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`;
        }
    }, [messageContent]);

    /**
     * handleSendMessage — Validates and sends the message.
     *
     * We trim whitespace to prevent sending empty or whitespace-only messages.
     * The isSending flag prevents double-sends if the user spams Enter.
     * After sending, we call onStoppedTyping to immediately clear the typing
     * indicator — the other user should see the message, not "typing...".
     */
    const handleSendMessage = async () => {
        // Don't send empty messages or messages that are only whitespace
        const trimmedContent = messageContent.trim();
        if (!trimmedContent || isSending) return;

        // Disable the input while sending to prevent double-sends
        // This is important because network requests take time, and
        // users might hit Enter multiple times thinking it didn't work
        setIsSending(true);

        try {
            onSendMessage(trimmedContent);
            setMessageContent(""); // Clear the input after sending

            // Immediately clear the typing indicator — the message is now sent,
            // so the other user should see the message appear, not "typing..."
            onStoppedTyping?.();
        } finally {
            setIsSending(false);
        }
    };

    /**
     * handleKeyDown — Keyboard shortcut handler.
     *
     * WHY Enter = send (not Shift+Enter):
     * In chat apps, the most frequent action is sending a single-line message.
     * Making Enter the "send" shortcut reduces friction for the 90% case.
     * Multi-line messages are less common, so they get the modifier key (Shift).
     *
     * This is the same pattern used by Slack, Discord, WhatsApp Web, and Telegram.
     */
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault(); // Prevent adding a newline
            handleSendMessage();
        }
        // If Shift+Enter is pressed, the default behavior (newline) happens naturally
    };

    /**
     * handleChange — Updates the message content and notifies typing status.
     *
     * We call onTyping on every keystroke. The debounce logic is in the
     * useTypingIndicator hook — it handles resetting the 2-second timer
     * so we don't need to worry about it here.
     */
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setMessageContent(e.target.value);

        // Notify the typing indicator hook — it handles debouncing internally
        onTyping?.();
    };

    return (
        <div className="border-t border-gray-700 bg-[#1a1d27] p-4">
            <div className="flex items-end gap-3">
                {/* Expanding textarea for message composition */}
                <textarea
                    ref={textareaRef}
                    value={messageContent}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message..."
                    disabled={isSending}
                    rows={1}
                    className="flex-1 resize-none rounded-xl border border-gray-700 bg-gray-800/50 px-4 py-3 text-sm text-white placeholder-zinc-500 outline-none transition-colors focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 disabled:opacity-50"
                // resize-none: prevents manual resize handle (we auto-resize instead)
                // rows={1}: starts as a single line, expands automatically
                />

                {/* Send button — visual alternative to pressing Enter */}
                <button
                    onClick={handleSendMessage}
                    disabled={!messageContent.trim() || isSending}
                    className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-purple-600 text-white transition-colors hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
                // disabled when: empty message OR currently sending
                // flex-shrink-0: prevents the button from shrinking when textarea expands
                >
                    <SendHorizontal className="h-5 w-5" />
                </button>
            </div>

            {/* Keyboard shortcut hint */}
            <p className="mt-2 text-[10px] text-zinc-600">
                Enter to send · Shift+Enter for new line
            </p>
        </div>
    );
}
