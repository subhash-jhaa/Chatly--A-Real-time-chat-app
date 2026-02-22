/**
 * NewChatButton — Opens a panel to search for users and start new conversations.
 * No props — manages its own open/close state internally.
 *
 * Separating this button from ConversationList keeps each component focused:
 *   - ConversationList: displays existing conversations
 *   - NewChatButton: handles creating new conversations
 *
 * Flow: Click button → UserList appears → Select user → getOrCreate mutation
 *       → Navigate to the conversation → Panel closes automatically
 */

"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { MessageSquarePlus, X } from "lucide-react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import UserList from "../UserList";

export default function NewChatButton() {
    // Controls whether the user search panel is visible
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();

    // getOrCreate finds an existing conversation OR creates a new one
    // This prevents duplicate conversations between the same two users
    const getOrCreateConversation = useMutation(api.conversations.getOrCreate);

    /**
     * handleSelectUser — Called when a user is selected from the UserList.
     *
     * Step 1: Call getOrCreate to get/create a conversation with the selected user
     * Step 2: Navigate to the conversation page
     * Step 3: Close the search panel
     *
     * We use getOrCreate (not just "create") so that clicking on a user
     * you've already chatted with takes you to the EXISTING conversation
     * instead of making a duplicate.
     */
    const handleSelectUser = async (userId: Id<"users">) => {
        try {
            // Get existing conversation or create a new one
            const conversationId = await getOrCreateConversation({
                participantId: userId,
            });

            // Navigate to the conversation
            router.push(`/conversations/${conversationId}`);

            // Close the search panel
            setIsOpen(false);
        } catch (error) {
            console.error("Failed to create conversation:", error);
        }
    };

    return (
        <>
            {/* ===== Trigger Button ===== */}
            <button
                onClick={() => setIsOpen(true)}
                className="mx-3 mt-3 flex items-center justify-center gap-2 rounded-lg bg-purple-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-purple-700"
            >
                <MessageSquarePlus className="h-4 w-4" />
                New Chat
            </button>

            {/* ===== User Search Panel (Overlay) ===== */}
            {/* When open, this slides over the conversation list */}
            {isOpen && (
                <div className="absolute inset-0 z-10 flex flex-col bg-[#1a1d27]">
                    {/* Panel Header with close button */}
                    <div className="flex items-center justify-between border-b border-gray-700 px-4 py-3">
                        <h2 className="text-sm font-semibold text-white">
                            New Conversation
                        </h2>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="rounded-lg p-1 text-zinc-400 transition-colors hover:bg-gray-700/50 hover:text-white"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    {/* UserList handles fetching users, search filtering, and rendering */}
                    {/* We just pass in our callback — UserList doesn't know about conversations */}
                    <UserList onSelectUser={handleSelectUser} />
                </div>
            )}
        </>
    );
}
