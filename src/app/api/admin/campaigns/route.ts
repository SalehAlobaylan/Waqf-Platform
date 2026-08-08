import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { adminCampaignsQuerySchema } from "@/lib/validation/schemas";
import { parseQuery } from "@/lib/validation/parse";

export async function GET(request: NextRequest) {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { role: true },
        });
        if (user?.role !== "ADMIN") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const parsedQuery = parseQuery(request, adminCampaignsQuerySchema);
        if (!parsedQuery.success) {
            return NextResponse.json(parsedQuery.error, { status: 400 });
        }
        const { status, page, limit } = parsedQuery.data;
        const offset = (page - 1) * limit;

        const where = status ? { status } : {};

        const [campaigns, total] = await Promise.all([
            prisma.campaign.findMany({
                where,
                include: {
                    owner: { select: { id: true, name: true, email: true, image: true } },
                    organization: { select: { id: true, name: true } },
                    roles: { include: { skill: true }, take: 3 },
                    _count: { select: { joins: true, roles: true } },
                },
                orderBy: [{ status: "asc" }, { createdAt: "desc" }],
                skip: offset,
                take: limit,
            }),
            prisma.campaign.count({ where }),
        ]);

        return NextResponse.json({
            campaigns,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error("[API] Admin campaigns error:", error);
        return NextResponse.json(
            { error: "Failed to fetch campaigns" },
            { status: 500 }
        );
    }
}
