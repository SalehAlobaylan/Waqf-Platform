import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAuthOrThrow } from "@/lib/auth-helpers";
import { withApiHandler, ApiHandlerContext } from "@/lib/api/handler";
import { githubUpdateSchema } from "@/lib/validation/schemas";
import { parseBody } from "@/lib/validation/parse";
import { checkRateLimit, rateLimitedResponse } from "@/lib/rate-limit";
import { fetchGithubPublicProfile } from "@/lib/github";

/**
 * GET /api/contributors/github
 * Returns the caller's stored GitHub connection (username + cached public
 * profile) so client components can render without a network call.
 */
export async function GET(request: NextRequest) {
    const ctx: ApiHandlerContext = {};
    return withApiHandler(request, "api.contributors.github.get", async () => {
        const user = await requireAuthOrThrow();
        ctx.userId = user.id;

        const profile = await prisma.contributorProfile.findUnique({
            where: { userId: user.id },
            select: { githubUsername: true, githubData: true, githubSynced: true },
        });

        return NextResponse.json({
            profile: {
                username: profile?.githubUsername ?? null,
                data: profile?.githubData ?? null,
                synced: profile?.githubSynced ?? false,
            },
        });
    }, ctx);
}

/**
 * PATCH /api/contributors/github
 * Stores the caller's GitHub username and syncs the public profile from the
 * unauthenticated GitHub REST API. `force: true` bypasses the in-process cache
 * (used by the Refresh button).
 */
export async function PATCH(request: NextRequest) {
    const ctx: ApiHandlerContext = {};
    return withApiHandler(request, "api.contributors.github.update", async () => {
        const user = await requireAuthOrThrow();
        ctx.userId = user.id;

        const rate = checkRateLimit(request, "github-sync", { limit: 10, windowMs: 60_000 }, user.id);
        if (!rate.allowed) {
            return rateLimitedResponse(rate);
        }

        const parsedBody = await parseBody(request, githubUpdateSchema);
        if (!parsedBody.success) {
            return NextResponse.json(parsedBody.error, { status: 400 });
        }

        const { username, force } = parsedBody.data;

        const githubData = await fetchGithubPublicProfile(username, { force });
        const githubDataJson: Prisma.InputJsonValue = githubData as unknown as Prisma.InputJsonValue;

        await prisma.contributorProfile.upsert({
            where: { userId: user.id },
            create: {
                userId: user.id,
                githubUsername: username,
                githubSynced: true,
                githubData: githubDataJson,
            },
            update: {
                githubUsername: username,
                githubSynced: true,
                githubData: githubDataJson,
            },
        });

        return NextResponse.json({ success: true, username, data: githubData });
    }, ctx);
}