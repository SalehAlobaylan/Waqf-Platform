import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withApiHandler } from "@/lib/api/handler";
import { routeIdParamSchema } from "@/lib/validation/schemas";
import { parseParams } from "@/lib/validation/parse";
import { makeNotFoundError } from "@/lib/validation/errors";
import { parseGitHubRepoUrl, fetchGitHubRepoInfo, fetchGitHubIssues } from "@/lib/github/repo";

interface RouteParams {
    params: Promise<{ id: string }>;
}

/**
 * GET /api/projects/[id]/github
 * Generic endpoint: returns public GitHub metadata for any project with a
 * repository URL. Not Toolkit-specific. Gracefully returns `null` fields
 * when GitHub is unavailable so Waqf remains resilient if Toolkit/repo is down.
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
    return withApiHandler(request, "api.projects.github", async () => {
        const parsedParams = parseParams(await params, routeIdParamSchema);
        if (!parsedParams.success) {
            return NextResponse.json(parsedParams.error, { status: 400 });
        }
        const { id } = parsedParams.data;

        const project = await prisma.project.findFirst({
            where: { OR: [{ id }, { slug: id }] },
            select: {
                id: true,
                slug: true,
                githubUrl: true,
                isOpenSource: true,
            },
        });

        if (!project) {
            return NextResponse.json(makeNotFoundError("Project not found", "id"), { status: 404 });
        }

        const parsed = parseGitHubRepoUrl(project.githubUrl);
        if (!parsed) {
            return NextResponse.json({
                repo: null,
                issues: [],
                meta: {
                    hasRepository: false,
                    isOpenSource: project.isOpenSource,
                },
            });
        }

        // Fetch in parallel, degrade gracefully
        const [repo, issues] = await Promise.all([
            fetchGitHubRepoInfo(parsed.owner, parsed.repo).catch(() => null),
            fetchGitHubIssues(parsed.owner, parsed.repo, { perPage: 8 }).catch(() => null),
        ]);

        return NextResponse.json({
            repo,
            issues: issues ?? [],
            meta: {
                hasRepository: true,
                isOpenSource: project.isOpenSource,
                owner: parsed.owner,
                repo: parsed.repo,
            },
        });
    });
}
