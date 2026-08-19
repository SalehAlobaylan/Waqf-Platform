import { NextRequest, NextResponse } from "next/server";
import { requireAdminOrThrow } from "@/lib/auth-helpers";
import { withApiHandler, ApiHandlerContext } from "@/lib/api/handler";
import { getPlatformStats } from "@/lib/stats";

export async function GET(request: NextRequest) {
    const ctx: ApiHandlerContext = {};
    return withApiHandler(request, "api.admin.stats", async () => {
        const admin = await requireAdminOrThrow();
        ctx.userId = admin.id;
        return NextResponse.json(await getPlatformStats());
    }, ctx);
}