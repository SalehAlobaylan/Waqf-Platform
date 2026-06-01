import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { routeIdParamSchema } from "@/lib/validation/schemas";
import { parseParams } from "@/lib/validation/parse";

interface RouteParams {
    params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
    try {
        const parsedParams = parseParams(await params, routeIdParamSchema);
        if (!parsedParams.success) {
            return NextResponse.json(parsedParams.error, { status: 400 });
        }

        const { id } = parsedParams.data;

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
