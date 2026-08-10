import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { skillsQuerySchema } from "@/lib/validation/schemas";
import { parseQuery } from "@/lib/validation/parse";
import { withApiHandler, ApiHandlerContext } from "@/lib/api/handler";

export async function GET(request: NextRequest) {
    const ctx: ApiHandlerContext = {};
    return withApiHandler(request, "api.skills.list", async () => {
        const parsedQuery = parseQuery(request, skillsQuerySchema);
        if (!parsedQuery.success) {
            return NextResponse.json(parsedQuery.error, { status: 400 });
        }

        const search = parsedQuery.data.search || parsedQuery.data.q || "";

        let skills;
        if (search) {
            skills = await prisma.skill.findMany({
                where: {
                    OR: [
                        { name: { contains: search, mode: "insensitive" } },
                        { nameAr: { contains: search, mode: "insensitive" } },
                        { aliases: { hasSome: [search] } }
                    ]
                },
                take: 20,
                orderBy: { name: "asc" }
            });
        } else {
            skills = await prisma.skill.findMany({
                take: 50,
                orderBy: { name: "asc" }
            });
        }

        return NextResponse.json(skills);
    }, ctx);
}
