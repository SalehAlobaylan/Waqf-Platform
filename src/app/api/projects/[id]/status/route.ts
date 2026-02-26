import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

interface RouteParams {
    params: Promise<{ id: string }>;
}

// Valid status transitions
const ownerTransitions: Record<string, string[]> = {
    DRAFT: ["PENDING", "CANCELLED"],
    OPEN: ["IN_PROGRESS", "CANCELLED"],
    IN_PROGRESS: ["COMPLETED", "CANCELLED"],
    CANCELLED: ["DRAFT"],
};

const adminTransitions: Record<string, string[]> = {
    PENDING: ["OPEN", "DRAFT"], // approve or return with feedback
};

export async function PATCH(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Authentication required" }, { status: 401 });
        }

        const { id } = await params;
        const body = await request.json();
        const { status: newStatus, adminFeedback } = body;

        if (!newStatus) {
            return NextResponse.json({ error: "Status is required" }, { status: 400 });
        }

        const project = await prisma.project.findUnique({
            where: { id },
            select: { ownerId: true, status: true },
        });

        if (!project) {
            return NextResponse.json({ error: "Project not found" }, { status: 404 });
        }

        const isOwner = project.ownerId === session.user.id;
        const isAdmin = session.user.role === "ADMIN";

        // Check valid transitions
        const currentStatus = project.status;
        let allowed: string[] = [];

        if (isOwner) {
            allowed = ownerTransitions[currentStatus] || [];
        }
        if (isAdmin) {
            allowed = [...allowed, ...(adminTransitions[currentStatus] || [])];
        }

        if (!allowed.includes(newStatus)) {
            return NextResponse.json(
                { error: `Cannot transition from ${currentStatus} to ${newStatus}` },
                { status: 400 }
            );
        }

        // Build update data
        const updateData: Record<string, unknown> = { status: newStatus };

        // Admin can attach feedback when returning to DRAFT
        if (isAdmin && newStatus === "DRAFT" && adminFeedback) {
            updateData.adminFeedback = adminFeedback;
        }

        // Clear feedback on re-submission
        if (newStatus === "PENDING") {
            updateData.adminFeedback = null;
        }

        const updated = await prisma.project.update({
            where: { id },
            data: updateData,
            select: { id: true, status: true, adminFeedback: true },
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error("[API] Status transition error:", error);
        return NextResponse.json({ error: "Failed to update status" }, { status: 500 });
    }
}
