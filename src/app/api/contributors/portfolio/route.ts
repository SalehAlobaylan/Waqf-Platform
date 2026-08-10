import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuthOrThrow } from "@/lib/auth-helpers";
import { withApiHandler, ApiHandlerContext } from "@/lib/api/handler";
import { forbidden } from "@/lib/api/errors";
import { portfolioCreateSchema, portfolioDeleteSchema } from "@/lib/validation/schemas";
import { parseBody, parseQuery } from "@/lib/validation/parse";

export async function POST(request: NextRequest) {
    const ctx: ApiHandlerContext = {};
    return withApiHandler(request, "api.contributors.portfolio.create", async () => {
        const user = await requireAuthOrThrow();
        ctx.userId = user.id;

        const parsedBody = await parseBody(request, portfolioCreateSchema);
        if (!parsedBody.success) {
            return NextResponse.json(parsedBody.error, { status: 400 });
        }

        const { title, description, url, contributorId, order } = parsedBody.data;

        const profile = await prisma.contributorProfile.findUnique({
            where: { userId: user.id },
            select: { id: true },
        });

        if (!profile || profile.id !== contributorId) {
            throw forbidden();
        }

        const newItem = await prisma.portfolioItem.create({
            data: {
                title,
                description,
                url,
                order: order || 0,
                contributorId,
            }
        });

        return NextResponse.json(newItem);
    }, ctx);
}

export async function DELETE(request: NextRequest) {
    const ctx: ApiHandlerContext = {};
    return withApiHandler(request, "api.contributors.portfolio.delete", async () => {
        const user = await requireAuthOrThrow();
        ctx.userId = user.id;

        const parsedQuery = parseQuery(request, portfolioDeleteSchema);
        if (!parsedQuery.success) {
            return NextResponse.json(parsedQuery.error, { status: 400 });
        }

        const profile = await prisma.contributorProfile.findUnique({
            where: { userId: user.id },
            select: { id: true },
        });

        if (!profile) throw forbidden();

        const item = await prisma.portfolioItem.findUnique({
            where: { id: parsedQuery.data.id },
            select: { contributorId: true },
        });

        if (!item || item.contributorId !== profile.id) {
            throw forbidden();
        }

        await prisma.portfolioItem.delete({
            where: { id: parsedQuery.data.id }
        });

        return NextResponse.json({ success: true });
    }, ctx);
}
