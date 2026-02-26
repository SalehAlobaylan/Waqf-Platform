import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get("q") || "";

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
    } catch (error) {
        console.error("Skills API error:", error);
        return NextResponse.json({ error: "Failed to fetch skills" }, { status: 500 });
    }
}
