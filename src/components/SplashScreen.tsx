"use client";

import { useEffect } from "react";

interface SplashScreenProps {
    onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onComplete();
        }, 2000);

        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <>
            <style>{`
                @keyframes popIn {
                    from { opacity: 0; transform: scale(0.5); }
                    to { opacity: 1; transform: scale(1); }
                }
                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(12px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes fillBar {
                    from { width: 0%; }
                    to { width: 100%; }
                }
                @keyframes bounce {
                    0%, 100% { transform: translateY(0); opacity: 0.4; }
                    50% { transform: translateY(-6px); opacity: 1; }
                }
            `}</style>

            <div
                style={{
                    position: "fixed",
                    inset: 0,
                    zIndex: 50,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "#0f1117",
                }}
            >
                {/* Logo */}
                <div
                    style={{
                        width: 96,
                        height: 96,
                        borderRadius: "50%",
                        background: "linear-gradient(135deg, #6c63ff, #00d4aa)",
                        boxShadow: "0 0 40px #6c63ff55",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        animation: "popIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
                    }}
                >
                    <span style={{ fontSize: "3rem", lineHeight: 1 }}>💬</span>
                </div>

                {/* App Name */}
                <h1
                    style={{
                        marginTop: 24,
                        fontSize: "2.25rem",
                        fontWeight: 800,
                        background: "linear-gradient(90deg, #6c63ff, #00d4aa)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        opacity: 0,
                        animation: "fadeUp 0.5s ease-out 0.3s forwards",
                    }}
                >
                    Chatly
                </h1>

                {/* Subtitle */}
                <p
                    style={{
                        marginTop: 8,
                        color: "#8b8fa8",
                        fontSize: "1rem",
                        letterSpacing: "0.05em",
                        opacity: 0,
                        animation: "fadeUp 0.5s ease-out 0.5s forwards",
                    }}
                >
                    Connect with anyone, instantly
                </p>

                {/* Bouncing Dots */}
                <div
                    style={{
                        display: "flex",
                        gap: 8,
                        marginTop: 32,
                        opacity: 0,
                        animation: "fadeUp 0.4s ease-out 0.7s forwards",
                    }}
                >
                    {[0.8, 0.95, 1.1].map((delay, i) => (
                        <div
                            key={i}
                            style={{
                                width: 8,
                                height: 8,
                                borderRadius: "50%",
                                backgroundColor: "#6c63ff",
                                animation: `bounce 0.6s ease-in-out ${delay}s infinite`,
                            }}
                        />
                    ))}
                </div>

                {/* Progress Bar */}
                <div
                    style={{
                        position: "absolute",
                        bottom: 56,
                        width: 176,
                        height: 3,
                        backgroundColor: "#2e3350",
                        borderRadius: 9999,
                        overflow: "hidden",
                        opacity: 0,
                        animation: "fadeUp 0.4s ease-out 0.7s forwards",
                    }}
                >
                    <div
                        style={{
                            height: "100%",
                            borderRadius: 9999,
                            background: "linear-gradient(90deg, #6c63ff, #00d4aa)",
                            width: 0,
                            animation: "fillBar 2s linear 0.8s forwards",
                        }}
                    />
                </div>
            </div>
        </>
    );
}
