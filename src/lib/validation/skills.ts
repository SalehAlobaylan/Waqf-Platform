import { prisma } from "@/lib/prisma";
import { makeValidationError, ValidationErrorResponse } from "@/lib/validation/errors";

/**
 * Verifies that every skill id in the input exists in the database.
 * Returns a field-level validation error response when one or more ids are
 * unknown (so routes can return 400 instead of hitting a Prisma FK 409),
 * otherwise null.
 */
export async function assertSkillsExist(
    skillIds: number[],
    path = "skills"
): Promise<ValidationErrorResponse | null> {
    if (!skillIds.length) return null;
    const uniqueIds = [...new Set(skillIds)];
    const found = await prisma.skill.findMany({
        where: { id: { in: uniqueIds } },
        select: { id: true },
    });
    if (found.length !== uniqueIds.length) {
        return makeValidationError("One or more skills not found", path);
    }
    return null;
}
