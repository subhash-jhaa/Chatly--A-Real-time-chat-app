/**
 * Root App Layout — Protected Route Layout with Sidebar
 *
 * WHY THIS LAYOUT PROTECTS ALL CHILD ROUTES:
 * In Next.js App Router, a layout.tsx file wraps ALL pages and nested layouts
 * inside its directory. Since this layout is at `app/(root)/layout.tsx`, every
 * page inside the (root) route group (e.g., the chat page, settings, etc.)
 * will pass through this layout BEFORE rendering.
 *
 * By checking authentication here, we create a single "gate" that protects
 * every child route — no need to add auth checks to individual pages.
 * If the user is not logged in, they get redirected to /sign-in immediately.
 *
 * WHY THE SIDEBAR LIVES IN THE LAYOUT:
 * The sidebar (ConversationList + NewChatButton) is rendered here in the layout,
 * NOT in individual pages. This means:
 *   1. The sidebar PERSISTS as users navigate between conversations
 *   2. It doesn't re-mount or lose state when switching chats
 *   3. Only the right panel ({children}) re-renders on navigation
 * This is a key Next.js App Router optimization — layouts don't re-render
 * on navigation, only the page content does.
 */

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import ConversationList from "@/components/sidebar/ConversationList";
import NewChatButton from "@/components/sidebar/NewChatButton";

export default async function RootAppLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // auth() is a server-side function from Clerk that returns the current session
    // We destructure userId — it will be null if the user is NOT signed in
    const { userId } = await auth();

    // If there is no userId, the user is not authenticated
    // redirect() from Next.js sends them to the sign-in page
    if (!userId) {
        redirect("/sign-in");
    }

    return (
        <div className="flex h-screen flex-col bg-[#0f1117]">
            {/* Navbar is rendered at the top of every protected page */}
            <Navbar />

            {/* ===== Main Content Area: Sidebar + Chat ===== */}
            {/* flex-1 + overflow-hidden: fills remaining height below navbar */}
            <div className="flex flex-1 overflow-hidden">
                {/* ===== Left Panel: Sidebar ===== */}
                {/* 
                  RESPONSIVE CLASSES:
                  hidden: on mobile (< 768px), sidebar is completely hidden — the
                    conversation list page takes the full screen instead
                  md:flex: on medium screens and up (768px+), sidebar becomes visible
                    as a flex column container
                  md:w-80: fixed width of 320px on desktop — wide enough for names
                    and message previews without wasting horizontal space
                  relative: creates a positioning context for NewChatButton's
                    absolute-positioned user search overlay panel
                  border-r: subtle 1px divider between sidebar and chat area
                  
                  WHY CSS NOT JS:
                  We use `hidden md:flex` instead of a JS-based show/hide because:
                    1. No React re-render needed when the window resizes
                    2. Sidebar state (scroll position, search text) is preserved
                    3. Works correctly during SSR — no hydration mismatch
                */}
                <aside className="relative hidden w-80 flex-col border-r border-gray-800 bg-[#1a1d27] md:flex">
                    {/* New Chat button — opens user search panel */}
                    <NewChatButton />

                    {/* Conversation list — shows all active chats */}
                    {/* flex-1 makes it fill remaining space below the button */}
                    <div className="mt-2 flex flex-1 flex-col overflow-hidden">
                        <ConversationList />
                    </div>
                </aside>

                {/* ===== Right Panel: Chat Area ===== */}
                {/* 
                  RESPONSIVE BEHAVIOR:
                  flex-1: takes up all remaining horizontal space after the sidebar.
                    On mobile (where sidebar is hidden), this means FULL WIDTH.
                    On desktop, this means everything right of the 320px sidebar.
                  flex flex-col: stacks child content vertically (header → messages → input)
                  overflow-hidden: prevents the chat area from scrolling the whole page —
                    scrolling is handled inside MessageList instead
                  {children}: the actual page content (conversation view or home page)
                  This panel re-renders on navigation; the sidebar does NOT
                */}
                <main className="flex flex-1 flex-col overflow-hidden">
                    {children}
                </main>
            </div>
        </div>
    );
}
