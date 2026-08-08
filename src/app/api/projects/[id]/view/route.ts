import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { routeIdParamSchema } from "@/lib/validation/schemas";
import { parseParams } from "@/lib/validation/parse";
import { checkRateLimit, rateLimitedResponse } from "@/lib/rate-limit";

interface RouteParams {
    params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
    try {
        if (!checkRateLimit(request, "project-view", { limit: 60, windowMs: 60_000 })) {
            return rateLimitedResponse();
        }

        const parsedParams = parseParams(await params, routeIdParamSchema);
        if (!parsedParams.success) {
            return NextResponse.json(parsedParams.error, { status: 400 });
        }

        const { id } = parsedParams.data;

        // updateMany avoids throwing on non-existent ids (404 semantics
        // preserved by callers that check the project exists first).
        await prisma.project.updateMany({
            where: { id },
            data: { viewCount: { increment: 1 } },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[API] View count error:", error);
        return NextResponse.json({ error: "Failed to track view" }, { status: 500 });
    }
}
