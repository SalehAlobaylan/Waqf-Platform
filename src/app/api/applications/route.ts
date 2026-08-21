import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuthOrThrow } from "@/lib/auth-helpers";
import { withApiHandler, ApiHandlerContext } from "@/lib/api/handler";
import { ApplicationStatus } from "@prisma/client";
import {
    applicationCreateSchema,
    applicationsQuerySchema,
} from "@/lib/validation/schemas";
import { parseBody, parseQuery } from "@/lib/validation/parse";
import { makeNotFoundError, makeValidationError } from "@/lib/validation/errors";
import { checkRateLimit, rateLimitedResponse } from "@/lib/rate-limit";
import { sendEventEmail } from "@/lib/event-email";
import { log } from "@/lib/logger";

/**
 * GET /api/applications
 * List applications (user's own or project owner's incoming)
 */
export async function GET(request: NextRequest) {
    const ctx: ApiHandlerContext = {};
    return withApiHandler(request, "api.applications.list", async () => {
        const user = await requireAuthOrThrow();
        ctx.userId = user.id;

        const parsedQuery = parseQuery(request, applicationsQuerySchema);
        if (!parsedQuery.success) {
            return NextResponse.json(parsedQuery.error, { status: 400 });
        }

        const { type, status, projectId, limit, offset } = parsedQuery.data;

        let applications;
        let total: number;

        if (type === "incoming") {
            const where = {
                project: {
                    ownerId: user.id,
                },
                ...(status && { status: status as ApplicationStatus }),
                ...(projectId && { projectId }),
            };
            // Get applications for projects the user owns
            [applications, total] = await Promise.all([
                prisma.application.findMany({
                    where,
                    include: {
                        project: {
                            select: {
                                id: true,
                                title: true,
                                slug: true,
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
                                        skills: {
                                            include: {
                                                skill: true,
                                            },
                                        },
                                    },
                                },
                            },
                        },
                        _count: {
                            select: {
                                messages: true,
                            },
                        },
                    },
                    orderBy: {
                        createdAt: "desc",
                    },
                    take: limit,
                    skip: offset,
                }),
                prisma.application.count({ where }),
            ]);
        } else {
            const where = {
                contributorId: user.id,
                ...(status && { status: status as ApplicationStatus }),
            };
            // Get user's own applications
            [applications, total] = await Promise.all([
                prisma.application.findMany({
                    where,
                    include: {
                        project: {
                            select: {
                                id: true,
                                title: true,
                                slug: true,
                                category: true,
                                status: true,
                                owner: {
                                    select: {
                                        id: true,
                                        name: true,
                                        image: true,
                                    },
                                },
                            },
                        },
                        _count: {
                            select: {
                                messages: true,
                            },
                        },
                    },
                    orderBy: {
                        createdAt: "desc",
                    },
                    take: limit,
                    skip: offset,
                }),
                prisma.application.count({ where }),
            ]);
        }

        return NextResponse.json({
            applications,
            pagination: { total, limit, offset, hasMore: offset + applications.length < total },
        });
    }, ctx);
}

/**
 * POST /api/applications
 * Submit a new application
 */
export async function POST(request: NextRequest) {
    const ctx: ApiHandlerContext = {};
    return withApiHandler(request, "api.applications.create", async () => {
        const user = await requireAuthOrThrow();
        ctx.userId = user.id;

        const rate = checkRateLimit(request, "application-create", { limit: 10, windowMs: 60_000 }, user.id);
        if (!rate.allowed) {
            return rateLimitedResponse(rate);
        }

        const parsedBody = await parseBody(request, applicationCreateSchema);
        if (!parsedBody.success) {
            return NextResponse.json(parsedBody.error, { status: 400 });
        }

        const { projectId, message, portfolioUrl, hoursPerWeek } = parsedBody.data;

        // Check if project exists and is open
        const project = await prisma.project.findUnique({
            where: { id: projectId },
            select: { id: true, status: true, ownerId: true, source: true },
        });

        if (!project) {
            return NextResponse.json(makeNotFoundError("Project not found", "projectId"), { status: 404 });
        }

        if (project.status !== "OPEN") {
            return NextResponse.json(
                makeValidationError("Project is not accepting applications", "projectId"),
                { status: 400 }
            );
        }

        // Block applications to external/curated projects (no owner to manage them)
        if (project.source === "EXTERNAL") {
            return NextResponse.json(
                makeValidationError("Cannot apply to external projects", "projectId"),
                { status: 400 }
            );
        }

        // Check if user is the project owner
        if (project.ownerId === user.id) {
            return NextResponse.json(
                makeValidationError("You cannot apply to your own project", "projectId"),
                { status: 400 }
            );
        }

        // Check for existing application
        const existingApplication = await prisma.application.findUnique({
            where: {
                projectId_contributorId: {
                    projectId,
                    contributorId: user.id,
                },
            },
        });

        if (existingApplication) {
            return NextResponse.json(
                makeValidationError("You have already applied to this project", "projectId"),
                { status: 400 }
            );
        }

        // Create application
        const application = await prisma.application.create({
            data: {
                projectId,
                contributorId: user.id,
                message,
                portfolioUrl,
                hoursPerWeek: hoursPerWeek ?? null,
            },
            include: {
                project: {
                    select: {
                        id: true,
                        title: true,
                        slug: true,
                    },
                },
            },
        });

        // Best-effort side effects: the application is already committed, so a
        // notification/email failure must not fail the request.
        if (project.ownerId) {
            try {
                await prisma.notification.create({
                    data: {
                        userId: project.ownerId,
                        type: "NEW_APPLICATION",
                        title: "New Application Received",
                        content: `${user.name} has applied to your project`,
                        link: `/projects/${application.project.slug}/applications`,
                    },
                });

                await sendEventEmail(project.ownerId, {
                    kind: "NEW_APPLICATION",
                    actorName: user.name ?? undefined,
                    projectTitle: application.project.title,
                    projectSlug: application.project.slug,
                    applicationId: application.id,
                });
            } catch (err) {
                log.warn("api.applications.create", "owner notification failed after commit", {
                    projectId,
                    ownerId: project.ownerId,
                }, err);
            }
        }

        return NextResponse.json({ application }, { status: 201 });
    }, ctx);
}
