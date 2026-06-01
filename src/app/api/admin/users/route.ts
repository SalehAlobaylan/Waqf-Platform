import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { adminUsersQuerySchema } from "@/lib/validation/schemas";
import { parseQuery, normalizeQueryValue } from "@/lib/validation/parse";

/**
 * GET /api/admin/users
 * List all users for admin management
 */
export async function GET(request: NextRequest) {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Check if user is admin
        const currentUser = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { role: true },
        });

        if (currentUser?.role !== "ADMIN") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

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
    } catch (error) {
        console.error("[API] Admin users error:", error);
        return NextResponse.json(
            { error: "Failed to fetch users" },
            { status: 500 }
        );
    }
}
