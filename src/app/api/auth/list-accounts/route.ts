import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth-helpers";
import { withApiHandler, ApiHandlerContext } from "@/lib/api/handler";

/**
 * GET /api/auth/list-accounts
 * Returns the list of provider IDs (e.g. ["github", "google"]) the current
 * user has linked. Used by the settings page to display connected sign-in
 * methods. Empty array if not signed in. Failures return the standard error
 * shape and are logged via the centralized handler.
 */
export async function GET(request: NextRequest) {
    const ctx: ApiHandlerContext = {};
    return withApiHandler(request, "api.auth.listAccounts", async () => {
        const user = await getSessionUser();
        if (!user) return NextResponse.json([]);

        ctx.userId = user.id;

        const accounts = await prisma.account.findMany({
            where: { userId: user.id },
            select: { providerId: true },
        });

        return NextResponse.json(accounts.map((a) => ({ providerId: a.providerId })));
    }, ctx);
}
