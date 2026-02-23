# 💬 Chatly — Real-Time Chat App

A modern real-time messaging application built with **Next.js**, **Convex**, and **Clerk**. Chat with anyone, instantly.

🌐 **Live Demo:** [chatwithchatly.vercel.app](https://chatwithchatly.vercel.app/)

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![Convex](https://img.shields.io/badge/Convex-Realtime-orange?logo=convex)
![Clerk](https://img.shields.io/badge/Clerk-Auth-blue?logo=clerk)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss)

---

## ✨ Features

- **Real-Time Messaging** — Messages appear instantly via Convex WebSocket subscriptions
- **Authentication** — Secure sign-in/sign-up powered by Clerk
- **Online/Offline Status** — See who's online with live presence indicators
- **Typing Indicators** — Real-time "typing..." status with auto-expiry
- **Emoji Reactions** — React to messages with 👍 ❤️ 😂 😮 😢
- **Message Deletion** — Soft-delete your own messages
- **Read Receipts** — Unread message badges on conversations
- **User Search** — Find and start conversations with any user
- **Conversation Search** — Filter conversations in the sidebar
- **Connection Status** — Banner alert when WebSocket connection is lost
- **Splash Screen** — Animated welcome screen on app launch
- **Responsive Design** — Works on desktop and mobile

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript |
| **Database & Backend** | Convex (real-time, serverless) |
| **Authentication** | Clerk |
| **Styling** | Tailwind CSS 4 + shadcn/ui |
| **Deployment** | Vercel |

---

## 📁 Project Structure

```
chat-app/
├── convex/                  # Backend (Convex functions)
│   ├── schema.ts            # Database schema
│   ├── users.ts             # User CRUD & presence
│   ├── conversations.ts     # Conversation management
│   ├── messages.ts          # Messaging & read receipts
│   ├── reactions.ts         # Emoji reactions
│   └── typing.ts            # Typing indicators
├── src/
│   ├── app/
│   │   ├── page.tsx         # Splash screen entry point
│   │   ├── layout.tsx       # Root layout with providers
│   │   ├── (auth)/          # Sign-in / Sign-up pages
│   │   └── (root)/          # Authenticated app shell
│   │       ├── layout.tsx   # Sidebar + main layout
│   │       └── conversations/
│   │           ├── page.tsx         # Conversations home
│   │           └── [id]/page.tsx    # Chat view
│   ├── components/
│   │   ├── chat/            # Chat UI (messages, input, reactions)
│   │   ├── sidebar/         # Sidebar (conversation list, new chat)
│   │   ├── ui/              # Shared UI components
│   │   ├── providers/       # Context providers
│   │   ├── SplashScreen.tsx  # Animated splash screen
│   │   ├── ErrorBoundary.tsx # Error handling
│   │   ├── Navbar.tsx       # Top navigation bar
│   │   └── UserList.tsx     # User search & selection
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # Utility functions
│   └── middleware.ts        # Route protection
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- A [Clerk](https://clerk.com) account
- A [Convex](https://convex.dev) account

### 1. Clone the repo

```bash
git clone https://github.com/subhash-jhaa/Chatly--A-Real-time-chat-app.git
cd Chatly--A-Real-time-chat-app
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env.local` file in the root:

```env
NEXT_PUBLIC_CONVEX_URL=your_convex_deployment_url
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
```

### 4. Start Convex

```bash
npx convex dev
```

### 5. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

---

## 🌐 Deployment

The app is deployed on **Vercel** with a production Convex backend.

1. Push your code to GitHub
2. Import the repo on [Vercel](https://vercel.com)
3. Add your environment variables in Vercel dashboard
4. Deploy your Convex backend: `npx convex deploy`

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
