import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminOrThrow } from "@/lib/auth-helpers";
import { withApiHandler, ApiHandlerContext } from "@/lib/api/handler";
import { adminUsersQuerySchema } from "@/lib/validation/schemas";
import { parseQuery, normalizeQueryValue } from "@/lib/validation/parse";

/**
 * GET /api/admin/users
 * List all users for admin management
 */
export async function GET(request: NextRequest) {
    const ctx: ApiHandlerContext = {};
    return withApiHandler(request, "api.admin.users.list", async () => {
        const admin = await requireAdminOrThrow();
        ctx.userId = admin.id;

        const parsedQuery = parseQuery(request, adminUsersQuerySchema);
        if (!parsedQuery.success) {
            return NextResponse.json(parsedQuery.error, { status: 400 });
        }

        const { search, role, page, limit } = parsedQuery.data;
        const offset = (page - 1) * limit;
        const searchValue = normalizeQueryValue(search || "");

        const where = {
            ...(searchValue && {
                OR: [
                    { name: { contains: searchValue, mode: "insensitive" as const } },
                    { email: { contains: searchValue, mode: "insensitive" as const } },
                ],
            }),
            ...(role && role !== "all" && { role: role as "USER" | "ADMIN" }),
        };

        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where,
                select: {
                    id: true,
                    name: true,
                    email: true,
                    image: true,
                    role: true,
                    createdAt: true,
                    _count: {
                        select: {
                            projects: true,
                            applications: true,
                        },
                    },
                },
                orderBy: { createdAt: "desc" },
                skip: offset,
                take: limit,
            }),
            prisma.user.count({ where }),
        ]);

        return NextResponse.json({
            users,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    }, ctx);
}
