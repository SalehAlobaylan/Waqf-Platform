import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { portfolioReorderSchema } from "@/lib/validation/schemas";
import { parseBody } from "@/lib/validation/parse";

export async function PUT(request: Request) {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const parsedBody = await parseBody(request, portfolioReorderSchema);
        if (!parsedBody.success) {
            return NextResponse.json(parsedBody.error, { status: 400 });
        }

        const { items } = parsedBody.data;

        const profile = await prisma.contributorProfile.findUnique({
            where: { userId: session.user.id },
            select: { id: true },
        });

        if (!profile) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

        const ownedCount = await prisma.portfolioItem.count({
            where: {
                contributorId: profile.id,
                id: { in: items.map((item) => item.id) },
            },
        });

        if (ownedCount !== items.length) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
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
    } catch {
        return NextResponse.json({ error: "Failed to reorder items" }, { status: 500 });
    }
}
