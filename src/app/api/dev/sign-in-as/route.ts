import { NextRequest, NextResponse } from "next/server";
import { randomUUID, createHmac } from "crypto";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { DEV_LOGIN_ENABLED } from "@/lib/dev/feature-flags";

export const dynamic = "force-dynamic";

const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;
const COOKIE_NAME = "better-auth.session_token";

function signCookieValue(value: string, secret: string): string {
    const signature = createHmac("sha256", secret)
        .update(value)
        .digest("base64");
    return `${value}.${signature}`;
}

export async function POST(request: NextRequest) {
    if (!DEV_LOGIN_ENABLED) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Defense-in-depth: feature flag should already exclude production,
    // but fail loudly if someone bypasses the env.
    if (process.env.NODE_ENV === "production") {
        console.error("[dev/sign-in-as] called in production — refusing");
        return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    let body: { email?: string };
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const email = body.email?.trim().toLowerCase();
    if (!email) {
        return NextResponse.json({ error: "email required" }, { status: 400 });
    }

    const secret = process.env.BETTER_AUTH_SECRET;
    if (!secret) {
        return NextResponse.json(
            { error: "BETTER_AUTH_SECRET not configured" },
            { status: 500 },
        );
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
        return NextResponse.json({ error: "user not found" }, { status: 404 });
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
}
