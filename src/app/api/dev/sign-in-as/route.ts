import { NextRequest, NextResponse } from "next/server";
import { randomUUID, createHmac } from "crypto";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { DEV_LOGIN_ENABLED } from "@/lib/dev/feature-flags";
import { withApiHandler, ApiHandlerContext } from "@/lib/api/handler";
import { AppError, invalidJson, validationError } from "@/lib/api/errors";
import { makeNotFoundError } from "@/lib/validation/errors";
import { log } from "@/lib/logger";

export const dynamic = "force-dynamic";

const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;
const IS_PRODUCTION = process.env.NODE_ENV === "production";
const COOKIE_NAME = IS_PRODUCTION
    ? "__Secure-better-auth.session_token"
    : "better-auth.session_token";

function signCookieValue(value: string, secret: string): string {
    const signature = createHmac("sha256", secret)
        .update(value)
        .digest("base64");
    return `${value}.${signature}`;
}

export async function POST(request: NextRequest) {
    const ctx: ApiHandlerContext = {};
    return withApiHandler(request, "api.dev.signInAs", async () => {
        if (!DEV_LOGIN_ENABLED) {
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }

        if (IS_PRODUCTION) {
            log.warn("api.dev.signInAs", "dev sign-in used in production — ENABLE_DEV_LOGIN is on");
        }

        let body: { email?: string };
        try {
            body = await request.json();
        } catch {
            throw invalidJson();
        }

        const email = body.email?.trim().toLowerCase();
        if (!email) {
            throw validationError("email required", "email");
        }

        const secret = process.env.BETTER_AUTH_SECRET;
        if (!secret) {
            // Generic message — never leak which env var is missing.
            throw new AppError({ status: 500, code: "INTERNAL", message: "Server configuration error" });
        }

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return NextResponse.json(makeNotFoundError("user not found", "email"), { status: 404 });
        }

        const token = randomUUID();
        const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

        await prisma.session.create({
            data: {
                token,
                userId: user.id,
                expiresAt,
                userAgent: `waqf-dev-helper/1.0 (${request.headers.get("user-agent") || "unknown"})`,
            },
        });

        const signed = signCookieValue(token, secret);

        const cookieStore = await cookies();
        cookieStore.set(COOKIE_NAME, signed, {
            httpOnly: true,
            sameSite: "lax",
            secure: IS_PRODUCTION,
            path: "/",
            maxAge: SESSION_DURATION_MS / 1000,
        });

        return NextResponse.json({
            ok: true,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    }, ctx);
}
