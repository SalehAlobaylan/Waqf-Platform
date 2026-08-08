import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { routeIdParamSchema } from "@/lib/validation/schemas";
import { parseParams } from "@/lib/validation/parse";
import { promoteCampaignToProject } from "@/lib/campaigns/promote";

interface RouteParams {
    params: Promise<{ id: string }>;
}

export async function POST(_request: NextRequest, { params }: RouteParams) {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Authentication required" }, { status: 401 });
        }
        const parsedParams = parseParams(await params, routeIdParamSchema);
        if (!parsedParams.success) {
            return NextResponse.json(parsedParams.error, { status: 400 });
        }
        const { id } = parsedParams.data;

        try {
            const result = await promoteCampaignToProject(id, session.user.id);
            return NextResponse.json(result);
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to promote";
            return NextResponse.json(
                { error: "Validation failed", details: [{ path: "promote", message }] },
                { status: 400 }
            );
        }
    } catch (error) {
        console.error("[API] Error promoting campaign:", error);
        return NextResponse.json({ error: "Failed to promote campaign" }, { status: 500 });
    }
}
