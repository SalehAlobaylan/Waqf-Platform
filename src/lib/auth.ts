import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { magicLink, emailOTP } from "better-auth/plugins";
import { prisma } from "@/lib/prisma";
import { ensureUniqueUsername, slugifyForUsername } from "@/lib/username";
import { sendEmail } from "@/lib/email";
import { magicLinkEmail } from "@/lib/email-templates/magic-link";
import { otpEmail } from "@/lib/email-templates/otp";

const defaultLocale = process.env.DEFAULT_LOCALE || "ar";

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    socialProviders: {
        github: {
            clientId: process.env.GITHUB_CLIENT_ID as string,
            clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
        },
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        },
    },
    accountLinking: {
        enabled: true,
        trustedProviders: ["github", "google"],
    },
    databaseHooks: {
        user: {
            create: {
                before: async (user) => {
                    const emailLocal = user.email?.split("@")[0] ?? "";
                    const providedUsername = typeof user.username === "string" ? user.username : "";
                    const providedName = typeof user.name === "string" ? user.name.trim() : "";
                    const name = providedName || emailLocal;
                    const base = providedUsername
                        || slugifyForUsername(name)
                        || emailLocal;
                    const username = await ensureUniqueUsername(prisma, base);
                    return { data: { ...user, name, username } };
                },
            },
        },
    },
    user: {
        additionalFields: {
            username: {
                type: "string",
                required: false,
                input: true,
            },
            role: {
                type: "string",
                defaultValue: "USER",
                input: false,
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
            maxAge: 5 * 60,
        },
    },
    plugins: [
        magicLink({
            expiresIn: 600,
            disableSignUp: false,
            sendMagicLink: async ({ email, url }) => {
                const locale = defaultLocale;
                const { subject, html, text } = magicLinkEmail({ url, email, locale });
                await sendEmail({ to: email, subject, html, text });
            },
        }),
        emailOTP({
            otpLength: 6,
            expiresIn: 600,
            disableSignUp: false,
            sendVerificationOTP: async ({ email, otp, type }) => {
                if (type !== "sign-in" && type !== "email-verification" && type !== "forget-password") {
                    return;
                }
                const locale = defaultLocale;
                const { subject, html, text } = otpEmail({ otp, email, locale, type });
                await sendEmail({ to: email, subject, html, text });
            },
        }),
    ],
});

export type Session = typeof auth.$Infer.Session;
