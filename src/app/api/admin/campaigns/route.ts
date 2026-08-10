import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminOrThrow } from "@/lib/auth-helpers";
import { withApiHandler, ApiHandlerContext } from "@/lib/api/handler";
import { adminCampaignsQuerySchema } from "@/lib/validation/schemas";
import { parseQuery } from "@/lib/validation/parse";

export async function GET(request: NextRequest) {
    const ctx: ApiHandlerContext = {};
    return withApiHandler(request, "api.admin.campaigns.list", async () => {
        const admin = await requireAdminOrThrow();
        ctx.userId = admin.id;

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
    }, ctx);
}
