import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { routeIdParamSchema } from "@/lib/validation/schemas";
import { parseParams } from "@/lib/validation/parse";
import { makeValidationError } from "@/lib/validation/errors";

interface RouteParams {
    params: Promise<{ id: string }>;
}

/**
 * GET /api/applications/[id]
 * Get a single application
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

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
            return NextResponse.json(
                makeValidationError("Application not found", "id"),
                { status: 404 }
            );
        }

        // Check if user has access (contributor or project owner)
        const isContributor = application.contributorId === session.user.id;
        const isOwner = application.project.ownerId === session.user.id;

        if (!isContributor && !isOwner) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        return NextResponse.json({
            application,
            isContributor,
            isOwner,
        });
    } catch (error) {
        console.error("[API] Get application error:", error);
        return NextResponse.json(
            { error: "Failed to fetch application" },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/applications/[id]
 * Withdraw an application
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
            return NextResponse.json(
                makeValidationError("Application not found", "id"),
                { status: 404 }
            );
        }

        // Only the contributor can withdraw
        if (application.contributorId !== session.user.id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
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
    } catch (error) {
        console.error("[API] Withdraw application error:", error);
        return NextResponse.json(
            { error: "Failed to withdraw application" },
            { status: 500 }
        );
    }
}
