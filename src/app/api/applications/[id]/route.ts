import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuthOrThrow } from "@/lib/auth-helpers";
import { withApiHandler, ApiHandlerContext } from "@/lib/api/handler";
import { routeIdParamSchema } from "@/lib/validation/schemas";
import { parseParams } from "@/lib/validation/parse";
import { makeNotFoundError, makeValidationError } from "@/lib/validation/errors";
import { checkRateLimit, rateLimitedResponse } from "@/lib/rate-limit";

interface RouteParams {
    params: Promise<{ id: string }>;
}

/**
 * GET /api/applications/[id]
 * Get a single application
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
    const ctx: ApiHandlerContext = {};
    return withApiHandler(request, "api.applications.get", async () => {
        const user = await requireAuthOrThrow();
        ctx.userId = user.id;

        const parsedParams = parseParams(await params, routeIdParamSchema);
        if (!parsedParams.success) {
            return NextResponse.json(parsedParams.error, { status: 400 });
        }

        const { id } = parsedParams.data;

        const application = await prisma.application.findUnique({
            where: { id },
            include: {
                project: {
                    select: {
                        id: true,
                        title: true,
                        slug: true,
                        category: true,
                        ownerId: true,
                        owner: {
                            select: {
                                id: true,
                                name: true,
                                image: true,
                            },
                        },
                    },
                },
                contributor: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true,
                        contributorProfile: {
                            select: {
                                bio: true,
                                timezone: true,
                                hoursPerWeek: true,
                                githubUsername: true,
                                skills: {
                                    include: {
                                        skill: true,
                                    },
                                },
                            },
                        },
                    },
                },
                messages: {
                    orderBy: {
                        createdAt: "asc",
                    },
                    include: {
                        sender: {
                            select: {
                                id: true,
                                name: true,
                                image: true,
                            },
                        },
                    },
                },
            },
        });

        if (!application) {
            return NextResponse.json(makeNotFoundError("Application not found", "id"), { status: 404 });
        }

        // Check if user has access (contributor or project owner)
        const isContributor = application.contributorId === user.id;
        const isOwner = application.project.ownerId === user.id;

        if (!isContributor && !isOwner) {
            return NextResponse.json({ error: "Forbidden", code: "FORBIDDEN" }, { status: 403 });
        }

        return NextResponse.json({
            application,
            isContributor,
            isOwner,
        });
    }, ctx);
}

/**
 * DELETE /api/applications/[id]
 * Withdraw an application
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    const ctx: ApiHandlerContext = {};
    return withApiHandler(request, "api.applications.withdraw", async () => {
        const user = await requireAuthOrThrow();
        ctx.userId = user.id;

        const rate = checkRateLimit(request, "application-withdraw", { limit: 20, windowMs: 60_000 }, user.id);
        if (!rate.allowed) {
            return rateLimitedResponse(rate);
        }

        const parsedParams = parseParams(await params, routeIdParamSchema);
        if (!parsedParams.success) {
            return NextResponse.json(parsedParams.error, { status: 400 });
        }

        const { id } = parsedParams.data;

        const application = await prisma.application.findUnique({
            where: { id },
            select: {
                contributorId: true,
                status: true,
            },
        });

        if (!application) {
            return NextResponse.json(makeNotFoundError("Application not found", "id"), { status: 404 });
        }

        // Only the contributor can withdraw
        if (application.contributorId !== user.id) {
            return NextResponse.json({ error: "Forbidden", code: "FORBIDDEN" }, { status: 403 });
        }

        // Can only withdraw pending applications
        if (application.status !== "PENDING") {
            return NextResponse.json(
                makeValidationError("Can only withdraw pending applications", "id"),
                { status: 400 }
            );
        }

        await prisma.application.update({
            where: { id },
            data: { status: "WITHDRAWN" },
        });

        return NextResponse.json({ success: true });
    }, ctx);
}
