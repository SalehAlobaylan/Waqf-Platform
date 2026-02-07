// Pusher configuration - placeholder until pusher packages are installed
// Install with: npm install pusher pusher-js

// Placeholder types when Pusher is not installed
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PusherServer = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PusherClient = any;

// Server-side Pusher instance
// Used in API routes to trigger events
let pusherServer: PusherServer | null = null;

try {
    // Dynamic import to avoid build errors when package is not installed
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Pusher = require("pusher");
    pusherServer = new Pusher({
        appId: process.env.PUSHER_APP_ID || "app-id",
        key: process.env.NEXT_PUBLIC_PUSHER_KEY || "app-key",
        secret: process.env.PUSHER_SECRET || "app-secret",
        cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "mt1",
        useTLS: true,
    });
} catch {
    // Pusher not installed - messaging will use polling fallback
    console.log("[Pusher] Server not initialized - using polling fallback");
}

export { pusherServer };

// Client-side Pusher instance
// Used in React components to subscribe to channels
let pusherClient: PusherClient | null = null;

export const getPusherClient = () => {
    if (typeof window === "undefined") return null;
    
    try {
        if (!pusherClient) {
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            const PusherClientLib = require("pusher-js");
            pusherClient = new PusherClientLib(
                process.env.NEXT_PUBLIC_PUSHER_KEY || "app-key",
                {
                    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "mt1",
                }
            );
        }
        return pusherClient;
    } catch {
        // Pusher not installed - using polling fallback
        return null;
    }
};

// Channel name helpers
export const getApplicationChannel = (applicationId: string) => 
    `private-application-${applicationId}`;

export const getUserChannel = (userId: string) => 
    `private-user-${userId}`;

// Event types
export const PUSHER_EVENTS = {
    NEW_MESSAGE: "new-message",
    MESSAGE_READ: "message-read",
    APPLICATION_UPDATE: "application-update",
    NEW_NOTIFICATION: "new-notification",
} as const;
