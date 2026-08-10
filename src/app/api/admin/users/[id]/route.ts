import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminOrThrow } from "@/lib/auth-helpers";
import { withApiHandler, ApiHandlerContext } from "@/lib/api/handler";
import { adminUserUpdateSchema, routeIdParamSchema } from "@/lib/validation/schemas";
import { parseBody, parseParams } from "@/lib/validation/parse";
import { makeValidationError } from "@/lib/validation/errors";

interface RouteParams {
    params: Promise<{ id: string }>;
}

/**
 * PATCH /api/admin/users/[id]
 * Update user role or ban user
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
    const ctx: ApiHandlerContext = {};
    return withApiHandler(request, "api.admin.users.update", async () => {
        const admin = await requireAdminOrThrow();
        ctx.userId = admin.id;

        const parsedParams = parseParams(await params, routeIdParamSchema);
        if (!parsedParams.success) {
            return NextResponse.json(parsedParams.error, { status: 400 });
        }

        const parsedBody = await parseBody(request, adminUserUpdateSchema);
        if (!parsedBody.success) {
            return NextResponse.json(parsedBody.error, { status: 400 });
        }

        const { id } = parsedParams.data;
        const { role } = parsedBody.data;

        // Prevent self-demotion
        if (id === admin.id && role !== "ADMIN") {
            return NextResponse.json(
                makeValidationError("Cannot demote yourself", "role"),
                { status: 400 }
            );
        }

        const updatedUser = await prisma.user.update({
            where: { id },
            data: {
                ...(role && { role }),
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
            },
        });

        return NextResponse.json({ success: true, user: updatedUser });
    }, ctx);
}

/**
 * DELETE /api/admin/users/[id]
 * Delete a user (admin only)
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    const ctx: ApiHandlerContext = {};
    return withApiHandler(request, "api.admin.users.delete", async () => {
        const admin = await requireAdminOrThrow();
        ctx.userId = admin.id;

        const parsedParams = parseParams(await params, routeIdParamSchema);
        if (!parsedParams.success) {
            return NextResponse.json(parsedParams.error, { status: 400 });
        }

        const { id } = parsedParams.data;

        // Prevent self-deletion
        if (id === admin.id) {
            return NextResponse.json(
                makeValidationError("Cannot delete yourself", "id"),
                { status: 400 }
            );
        }

        await prisma.user.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    }, ctx);
}
