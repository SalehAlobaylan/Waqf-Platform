import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { ApplicationStatus } from "@prisma/client";

/**
 * GET /api/applications
 * List applications (user's own or project owner's incoming)
 */
export async function GET(request: NextRequest) {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const type = searchParams.get("type") || "mine"; // "mine" or "incoming"
        const status = searchParams.get("status");
        const projectId = searchParams.get("projectId");

        let applications;

        if (type === "incoming") {
            // Get applications for projects the user owns
            applications = await prisma.application.findMany({
                where: {
                    project: {
                        ownerId: session.user.id,
                    },
                    ...(status && { status: status as ApplicationStatus }),
                    ...(projectId && { projectId }),
                },
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
            });
        } else {
            // Get user's own applications
            applications = await prisma.application.findMany({
                where: {
                    contributorId: session.user.id,
                    ...(status && { status: status as ApplicationStatus }),
                },
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
            });
        }

        return NextResponse.json({ applications });
    } catch (error) {
        console.error("[API] Get applications error:", error);
        return NextResponse.json(
            { error: "Failed to fetch applications" },
            { status: 500 }
        );
    }
}

/**
 * POST /api/applications
 * Submit a new application
 */
export async function POST(request: NextRequest) {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { projectId, message, portfolioUrl, hoursPerWeek } = body;

        if (!projectId) {
            return NextResponse.json(
                { error: "Project ID is required" },
                { status: 400 }
            );
        }

        // Check if project exists and is open
        const project = await prisma.project.findUnique({
            where: { id: projectId },
            select: { id: true, status: true, ownerId: true },
        });

        if (!project) {
            return NextResponse.json(
                { error: "Project not found" },
                { status: 404 }
            );
        }

        if (project.status !== "OPEN") {
            return NextResponse.json(
                { error: "Project is not accepting applications" },
                { status: 400 }
            );
        }

        // Check if user is the project owner
        if (project.ownerId === session.user.id) {
            return NextResponse.json(
                { error: "You cannot apply to your own project" },
                { status: 400 }
            );
        }

        // Check for existing application
        const existingApplication = await prisma.application.findUnique({
            where: {
                projectId_contributorId: {
                    projectId,
                    contributorId: session.user.id,
                },
            },
        });

        if (existingApplication) {
            return NextResponse.json(
                { error: "You have already applied to this project" },
                { status: 400 }
            );
        }

        // Create application
        const application = await prisma.application.create({
            data: {
                projectId,
                contributorId: session.user.id,
                message,
                portfolioUrl,
                hoursPerWeek: hoursPerWeek ? parseInt(hoursPerWeek) : null,
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

        // Create notification for project owner
        await prisma.notification.create({
            data: {
                userId: project.ownerId,
                type: "NEW_APPLICATION",
                title: "New Application Received",
                content: `${session.user.name} has applied to your project`,
                link: `/projects/${application.project.slug}/applications`,
            },
        });

        return NextResponse.json({ application }, { status: 201 });
    } catch (error) {
        console.error("[API] Create application error:", error);
        return NextResponse.json(
            { error: "Failed to submit application" },
            { status: 500 }
        );
    }
}
