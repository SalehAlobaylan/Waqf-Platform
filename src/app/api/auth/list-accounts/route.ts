import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/auth/list-accounts
 * Returns the list of provider IDs (e.g. ["github", "google"]) the current
 * user has linked. Used by the settings page to display connected sign-in
 * methods. Empty array if not signed in.
 */
export async function GET() {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session?.user?.id) {
            return NextResponse.json([]);
        }

        const accounts = await prisma.account.findMany({
            where: { userId: session.user.id },
            select: { providerId: true },
        });

        return NextResponse.json(accounts.map((a) => ({ providerId: a.providerId })));
    } catch (error) {
        console.error("[auth/list-accounts] error:", error);
        return NextResponse.json([]);
    }
}
