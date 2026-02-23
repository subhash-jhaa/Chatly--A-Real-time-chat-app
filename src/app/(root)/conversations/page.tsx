import { MessageSquare } from "lucide-react";
import ConversationList from "@/components/sidebar/ConversationList";
import NewChatButton from "@/components/sidebar/NewChatButton";

export default function HomePage() {
    return (
        <div className="relative flex h-full flex-col bg-[#0f1117]">
            {/* 
              MOBILE VIEW: Conversation List
              Visible only on screens smaller than 768px (md:hidden).
              This provides mobile users with easy access to their chats since
              the sidebar is hidden in the root layout on small screens.
            */}
            <div className="flex flex-1 flex-col overflow-hidden md:hidden">
                {/* Reusing the same components from the sidebar for consistency */}
                <NewChatButton />
                <div className="mt-2 flex flex-1 flex-col overflow-hidden">
                    <ConversationList />
                </div>
            </div>

            {/* 
              DESKTOP VIEW: Welcome Message
              Visible only on screens 768px and wider (md:flex).
              On desktop, the sidebar is always visible on the left, so we
              show a helpful welcome message in the main content area.
            */}
            <div className="hidden h-full flex-1 flex-col items-center justify-center text-center md:flex">
                <div className="flex flex-col items-center gap-3">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-600/10">
                        <MessageSquare className="h-8 w-8 text-purple-400" />
                    </div>
                    <h2 className="text-lg font-semibold text-white">
                        Welcome to Chatly
                    </h2>
                    <p className="max-w-xs text-sm text-zinc-500">
                        Select a conversation from the sidebar or start a new chat
                    </p>
                </div>
            </div>
        </div>
    );
}
