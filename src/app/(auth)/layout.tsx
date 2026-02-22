import Link from "next/link";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="relative flex min-h-screen flex-col overflow-hidden" style={{ backgroundColor: "#0b0d14" }}>
            {/* Curved blue header */}
            <div className="relative w-full" style={{ minHeight: "240px" }}>
                {/* Blue gradient background */}
                <div
                    className="absolute inset-0"
                    style={{
                        background: "linear-gradient(135deg, #0a1628 0%, #0f2847 40%, #1a3a6b 100%)",
                    }}
                />

                {/* Curved bottom edge */}
                <svg
                    className="absolute bottom-0 left-0 w-full"
                    viewBox="0 0 1440 120"
                    preserveAspectRatio="none"
                    style={{ height: "120px" }}
                >
                    <path
                        d="M0,120 C480,0 960,0 1440,120 L1440,120 L0,120 Z"
                        style={{ fill: "#0b0d14" }}
                    />
                </svg>

                {/* Header content */}
                <div className="relative z-10 px-8 pt-12">
                    <h1 className="text-3xl font-bold text-cyan-400">
                        Chat<span className="text-white">ly</span>
                    </h1>
                    <h2 className="mt-6 text-2xl font-semibold leading-tight text-cyan-400">
                        Welcome back
                    </h2>
                    <p className="mt-1 text-sm text-zinc-400">
                        Sign in to continue chatting
                    </p>
                </div>
            </div>

            {/* Form area */}
            <div className="relative z-10 -mt-8 flex flex-1 flex-col items-center px-6">
                {children}
            </div>
        </div>
    );
}
