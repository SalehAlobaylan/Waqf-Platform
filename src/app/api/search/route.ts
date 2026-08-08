import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma, ProjectCategory, ProjectStatus } from "@prisma/client";
import { searchQuerySchema } from "@/lib/validation/schemas";
import { parseQuery } from "@/lib/validation/parse";

/**
 * GET /api/search
 * Full-text search across projects (PostgreSQL tsvector + GIN index,
 * roadmap §3.2). Falls back to ILIKE for queries that cannot be parsed
 * into a tsquery (e.g. short/symbol-only input).
 */
export async function GET(request: NextRequest) {
    try {
        const parsedQuery = parseQuery(request, searchQuerySchema);
        if (!parsedQuery.success) {
            return NextResponse.json(parsedQuery.error, { status: 400 });
        }

        const { q: query, category, status = "OPEN", limit, offset } = parsedQuery.data;

        if (!query) {
            return NextResponse.json({
                projects: [],
                total: 0,
                query: "",
            });
        }

        const statusFilter = status === "ALL"
            ? [ProjectStatus.OPEN, ProjectStatus.IN_PROGRESS, ProjectStatus.COMPLETED]
            : [status as ProjectStatus];

        const statusArray = Prisma.sql`${statusFilter}::"ProjectStatus"[]`;

        const categoryFilter = category
            ? Prisma.sql`AND p."category" = ${category}::"ProjectCategory"`
            : Prisma.empty;

        // Normalize query into a boolean tsquery (AND of terms)
        const terms = query
            .trim()
            .split(/\s+/)
            .map((t) => t.replace(/[&|:!()'*\\<>-]/g, ""))
            .filter((t) => t.length > 0);

        let results: { id: string }[] = [];
        let total = 0;

        if (terms.length > 0) {
            const tsQuery = terms.join(" & ");

            // Ranked full-text matches (tsvector is maintained by a trigger)
            const [ftsRows, ftsCount] = await Promise.all([
                prisma.$queryRaw<{ id: string }[]>(Prisma.sql`
                    SELECT p."id"
                    FROM "Project" p
                    WHERE p."search_vector" @@ to_tsquery('simple', ${tsQuery})
                      AND p."status" = ANY(${statusArray})
                      ${categoryFilter}
                    ORDER BY ts_rank(p."search_vector", to_tsquery('simple', ${tsQuery})) DESC,
                             p."featured" DESC,
                             p."createdAt" DESC
                    LIMIT ${limit} OFFSET ${offset}
                `),
                prisma.$queryRaw<{ count: bigint }[]>(Prisma.sql`
                    SELECT COUNT(*)::bigint AS count
                    FROM "Project" p
                    WHERE p."search_vector" @@ to_tsquery('simple', ${tsQuery})
                      AND p."status" = ANY(${statusArray})
                      ${categoryFilter}
                `),
            ]);
            results = ftsRows as { id: string }[];
            total = Number((ftsCount as { count: bigint }[])[0]?.count ?? 0);
        }

        // If full-text found nothing (or the query had no parseable terms),
        // fall back to substring matching so partial terms still work.
        let projects: Array<Record<string, unknown>> = [];
        if (results.length === 0 && query.trim().length > 0) {
            const whereCondition: Prisma.ProjectWhereInput = {
                status: { in: statusFilter },
                ...(category ? { category: category as ProjectCategory } : {}),
                OR: [
                    { title: { contains: query, mode: "insensitive" as const } },
                    { description: { contains: query, mode: "insensitive" as const } },
                    { impact: { contains: query, mode: "insensitive" as const } },
                ],
            };

            const [fallbackProjects, fallbackTotal] = await Promise.all([
                prisma.project.findMany({
                    where: whereCondition,
                    include: {
                        skills: { include: { skill: true } },
                        owner: { select: { id: true, name: true, image: true } },
                        _count: { select: { applications: true } },
                    },
                    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
                    skip: offset,
                    take: limit,
                }),
                prisma.project.count({ where: whereCondition }),
            ]);

            projects = fallbackProjects as unknown as Array<Record<string, unknown>>;
            total = fallbackTotal;
        } else if (results.length > 0) {
            const ids = results.map((r) => r.id);
            projects = (await prisma.project.findMany({
                where: { id: { in: ids } },
                include: {
                    skills: { include: { skill: true } },
                    owner: { select: { id: true, name: true, image: true } },
                    _count: { select: { applications: true } },
                },
            })) as unknown as Array<Record<string, unknown>>;

            // Preserve the rank order from the tsvector query
            const order = new Map(results.map((r, i) => [r.id, i]));
            projects.sort((a, b) => {
                const aid = typeof a.id === "string" ? a.id : String(a.id);
                const bid = typeof b.id === "string" ? b.id : String(b.id);
                return (order.get(aid) ?? 0) - (order.get(bid) ?? 0);
            });
        }

        return NextResponse.json({
            projects,
            total,
            query,
            limit,
            offset,
        });
    } catch (error) {
        console.error("[API] Search error:", error);
        return NextResponse.json(
            { error: "Search failed" },
            { status: 500 }
        );
    }
}
