"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { SmilePlus } from "lucide-react";

const EMOJIS = ["👍", "❤️", "😂", "😮", "😢"];

interface ReactionPickerProps {
    messageId: Id<"messages">;
    isMyMessage: boolean;
}

export default function ReactionPicker({ messageId, isMyMessage }: ReactionPickerProps) {
    const [open, setOpen] = useState(false);
    const toggleReaction = useMutation(api.reactions.toggleReaction);

    const handlePick = async (emoji: string) => {
        await toggleReaction({ messageId, emoji });
        setOpen(false);
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <button
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-gray-700/50 text-zinc-400 hover:text-zinc-200"
                    aria-label="Add reaction"
                >
                    <SmilePlus className="h-3.5 w-3.5" />
                </button>
            </PopoverTrigger>
            <PopoverContent
                className="w-auto p-1.5 bg-gray-800 border-gray-700"
                side={isMyMessage ? "left" : "right"}
            >
                <div className="flex gap-1">
                    {EMOJIS.map((emoji) => (
                        <button
                            key={emoji}
                            onClick={() => handlePick(emoji)}
                            className="p-1.5 rounded hover:bg-gray-700 transition-colors text-base"
                        >
                            {emoji}
                        </button>
                    ))}
                </div>
            </PopoverContent>
        </Popover>
    );
}
