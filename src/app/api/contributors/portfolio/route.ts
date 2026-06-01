import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { portfolioCreateSchema, portfolioDeleteSchema } from "@/lib/validation/schemas";
import { parseBody, parseQuery } from "@/lib/validation/parse";

export async function POST(request: Request) {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const parsedBody = await parseBody(request, portfolioCreateSchema);
        if (!parsedBody.success) {
            return NextResponse.json(parsedBody.error, { status: 400 });
        }

        const { title, description, url, contributorId, order } = parsedBody.data;

        const profile = await prisma.contributorProfile.findUnique({
            where: { userId: session.user.id },
            select: { id: true },
        });

        if (!profile || profile.id !== contributorId) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
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
    } catch {
        return NextResponse.json({ error: "Failed to create item" }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const parsedQuery = parseQuery(request, portfolioDeleteSchema);
        if (!parsedQuery.success) {
            return NextResponse.json(parsedQuery.error, { status: 400 });
        }

        const profile = await prisma.contributorProfile.findUnique({
            where: { userId: session.user.id },
            select: { id: true },
        });

        if (!profile) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

        const item = await prisma.portfolioItem.findUnique({
            where: { id: parsedQuery.data.id },
            select: { contributorId: true },
        });

        if (!item || item.contributorId !== profile.id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        await prisma.portfolioItem.delete({
            where: { id: parsedQuery.data.id }
        });

        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json({ error: "Failed to delete item" }, { status: 500 });
    }
}
