"use client";

import { useConvex } from "convex/react";
import { useEffect, useState } from "react";

export default function ConnectionStatus() {
    const convex = useConvex();
    const [isDisconnected, setIsDisconnected] = useState(false);

    useEffect(() => {
        // Poll the Convex client's connection state every 2 seconds.
        // There's no built-in event listener for connection changes,
        // so we check periodically and compare against a watchdog.
        let watchdog: ReturnType<typeof setTimeout>;
        let interval: ReturnType<typeof setInterval>;

        // Only show the banner after 3s of disconnection to avoid
        // flashing during brief network hiccups
        const GRACE_PERIOD = 3000;

        const checkConnection = () => {
            // convex.connectionState() exposes the WebSocket readiness
            const state = convex.connectionState();
            const connected = state.isWebSocketConnected ?? true;

            if (!connected) {
                watchdog = watchdog ?? setTimeout(() => setIsDisconnected(true), GRACE_PERIOD);
            } else {
                clearTimeout(watchdog);
                watchdog = undefined as unknown as ReturnType<typeof setTimeout>;
                setIsDisconnected(false);
            }
        };

        interval = setInterval(checkConnection, 2000);
        return () => {
            clearInterval(interval);
            clearTimeout(watchdog);
        };
    }, [convex]);

    if (!isDisconnected) return null;

    return (
        <div className="flex items-center justify-center gap-2 bg-yellow-900/80 px-4 py-2 text-sm text-yellow-200">
            <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-yellow-400 opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-yellow-500" />
            </span>
            Connection lost. Trying to reconnect...
        </div>
    );
}
