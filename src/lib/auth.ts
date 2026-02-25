import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@/lib/prisma";

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    emailAndPassword: {
        enabled: true,
        minPasswordLength: 8,
    },
    socialProviders: {
        github: {
            clientId: process.env.GITHUB_CLIENT_ID as string,
            clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
        },
    },
    user: {
        additionalFields: {
            role: {
                type: "string",
                defaultValue: "USER",
                input: false, // Prevent users from setting their own role
            },
            preferredLanguage: {
                type: "string",
                defaultValue: "ar",
                input: true,
            },
        },
    },
    session: {
        cookieCache: {
            enabled: true,
            maxAge: 5 * 60, // 5 minute cache
        },
    },
});

export type Session = typeof auth.$Infer.Session;
