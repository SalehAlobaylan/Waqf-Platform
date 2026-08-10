import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { unauthorized, forbidden } from "@/lib/api/errors";

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
 * Returns false immediately for an empty id to avoid a pointless DB query.
 */
export async function isAdminUserId(userId: string): Promise<boolean> {
    if (!userId) return false;
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
 * Guard: returns the session user or throws a 401 AppError. Throw-based so it
 * composes with `withApiHandler`; catches render the standard error shape.
 */
export async function requireAuthOrThrow(): Promise<SessionUser> {
    const user = await getSessionUser();
    if (!user) throw unauthorized();
    return user;
}

/**
 * Guard: returns the session user only when they are an admin (role re-fetched
 * from the DB), otherwise throws 401/403 AppErrors.
 */
export async function requireAdminOrThrow(): Promise<SessionUser> {
    const user = await requireAuthOrThrow();
    if (!(await isAdminUserId(user.id))) throw forbidden();
    return user;
}
