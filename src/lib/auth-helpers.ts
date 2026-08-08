import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export interface SessionUser {
    id: string;
    email: string;
    name: string;
    image: string | null;
    role: string;
}

/**
 * Optional-auth session lookup. Returns the session user, or null when the
 * request is unauthenticated. Safe for public routes that need owner-aware
 * behavior.
 */
export async function getSessionUser(): Promise<SessionUser | null> {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) return null;
    return session.user as SessionUser;
}

/**
 * Role is always re-fetched from the DB so a demoted admin loses elevated
 * access immediately (session cookie caches are not authoritative).
 */
export async function isAdminUserId(userId: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true },
    });
    return user?.role === "ADMIN";
}

export async function isAdminUser(user: SessionUser | null): Promise<boolean> {
    if (!user) return false;
    return isAdminUserId(user.id);
}

/**
 * Guard: returns the user, or a 401/403 NextResponse when not allowed.
 */
export async function requireAuth(): Promise<{
    user: SessionUser | null;
    response: NextResponse | null;
}> {
    const user = await getSessionUser();
    if (!user) {
        return {
            user: null,
            response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
        };
    }
    return { user, response: null };
}

/**
 * Guard: returns the admin user, or a 401/403 NextResponse when not allowed.
 */
export async function requireAdmin(): Promise<{
    admin: SessionUser | null;
    response: NextResponse | null;
}> {
    const { user, response } = await requireAuth();
    if (response) return { admin: null, response };

    if (!(await isAdminUserId(user!.id))) {
        return {
            admin: null,
            response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
        };
    }
    return { admin: user, response: null };
}
