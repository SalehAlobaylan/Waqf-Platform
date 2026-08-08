import PusherServer from "pusher";
import PusherClient from "pusher-js";

// Server-side Pusher instance
// Only initialized when PUSHER_APP_ID env var is set
let pusherServerInstance: PusherServer | null = null;

function getPusherServer(): PusherServer | null {
    if (pusherServerInstance) return pusherServerInstance;

    const appId = process.env.PUSHER_APP_ID;
    const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
    const secret = process.env.PUSHER_SECRET;
    const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;

    if (!appId || !key || !secret || !cluster) {
        return null;
    }

    pusherServerInstance = new PusherServer({
        appId,
        key,
        secret,
        cluster,
        useTLS: true,
    });

    return pusherServerInstance;
}

export { getPusherServer as pusherServer };

// Client-side Pusher instance
// Only initialized when NEXT_PUBLIC_PUSHER_KEY env var is set
let pusherClientInstance: PusherClient | null = null;

export const getPusherClient = (): PusherClient | null => {
    if (typeof window === "undefined") return null;

    if (pusherClientInstance) return pusherClientInstance;

    const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
    const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;

    if (!key || !cluster) {
        return null;
    }

    pusherClientInstance = new PusherClient(key, { cluster });
    return pusherClientInstance;
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
