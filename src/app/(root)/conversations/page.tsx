import { MessageSquare } from "lucide-react";

export default function HomePage() {
    return (
        <div className="flex h-full flex-col items-center justify-center bg-[#0f1117] text-center">
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
    );
}
