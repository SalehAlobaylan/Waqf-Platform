import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuthOrThrow } from "@/lib/auth-helpers";
import { withApiHandler, ApiHandlerContext } from "@/lib/api/handler";
import { forbidden } from "@/lib/api/errors";
import { portfolioReorderSchema } from "@/lib/validation/schemas";
import { parseBody } from "@/lib/validation/parse";
import { checkRateLimit, rateLimitedResponse } from "@/lib/rate-limit";

export async function PUT(request: NextRequest) {
    const ctx: ApiHandlerContext = {};
    return withApiHandler(request, "api.contributors.portfolio.reorder", async () => {
        const user = await requireAuthOrThrow();
        ctx.userId = user.id;

        const rate = checkRateLimit(request, "portfolio-reorder", { limit: 30, windowMs: 60_000 }, user.id);
        if (!rate.allowed) {
            return rateLimitedResponse(rate);
        }

        const parsedBody = await parseBody(request, portfolioReorderSchema);
        if (!parsedBody.success) {
            return NextResponse.json(parsedBody.error, { status: 400 });
        }

        const { items } = parsedBody.data;

        const profile = await prisma.contributorProfile.findUnique({
            where: { userId: user.id },
            select: { id: true },
        });

        if (!profile) throw forbidden();

        const ownedCount = await prisma.portfolioItem.count({
            where: {
                contributorId: profile.id,
                id: { in: items.map((item) => item.id) },
            },
        });

        if (ownedCount !== items.length) {
            throw forbidden();
        }

        // We use a transaction to update all items reliably
        await prisma.$transaction(
            items.map((item: { id: string, order: number }) =>
                prisma.portfolioItem.update({
                    where: { id: item.id },
                    data: { order: item.order }
                })
            )
        );

        return NextResponse.json({ success: true });
    }, ctx);
}
