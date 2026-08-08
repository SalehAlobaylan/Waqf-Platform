import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields, magicLinkClient, emailOTPClient } from "better-auth/client/plugins";
import type { auth } from "@/lib/auth";

export const authClient = createAuthClient({
    baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    plugins: [
        inferAdditionalFields<typeof auth>(),
        magicLinkClient(),
        emailOTPClient(),
    ],
});

export type Session = typeof authClient.$Infer.Session;
