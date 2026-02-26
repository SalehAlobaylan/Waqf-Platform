import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface RouteParams {
    params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;

        await prisma.project.update({
            where: { id },
            data: { viewCount: { increment: 1 } },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[API] View count error:", error);
        return NextResponse.json({ error: "Failed to track view" }, { status: 500 });
    }
}
