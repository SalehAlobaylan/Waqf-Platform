import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuthOrThrow } from "@/lib/auth-helpers";
import { withApiHandler, ApiHandlerContext } from "@/lib/api/handler";
import { profileUpdateSchema } from "@/lib/validation/schemas";
import { parseBody } from "@/lib/validation/parse";
import { assertSkillsExist } from "@/lib/validation/skills";
import { checkRateLimit, rateLimitedResponse } from "@/lib/rate-limit";

export async function PATCH(request: NextRequest) {
    const ctx: ApiHandlerContext = {};
    return withApiHandler(request, "api.contributors.profile.update", async () => {
        const user = await requireAuthOrThrow();
        ctx.userId = user.id;

        const rate = checkRateLimit(request, "profile-update", { limit: 20, windowMs: 60_000 }, user.id);
        if (!rate.allowed) {
            return rateLimitedResponse(rate);
        }

        const parsedBody = await parseBody(request, profileUpdateSchema);
        if (!parsedBody.success) {
            return NextResponse.json(parsedBody.error, { status: 400 });
        }

        const { bio, intentionStatement, discord, whatsapp, isAvailable, hoursPerWeek, selectedSkills } = parsedBody.data;
        const userId = user.id;

        if (selectedSkills?.length) {
            const skillError = await assertSkillsExist(selectedSkills, "selectedSkills");
            if (skillError) {
                return NextResponse.json(skillError, { status: 400 });
            }
        }

        const normalizedHours = hoursPerWeek ?? undefined;

        const updatedProfile = await prisma.$transaction(async (tx) => {
            const profile = await tx.contributorProfile.upsert({
                where: { userId },
                create: {
                    userId,
                    bio: bio || null,
                    intentionStatement: intentionStatement || null,
                    discord: discord || null,
                    whatsapp: whatsapp || null,
                    isAvailable: isAvailable ?? true,
                    hoursPerWeek: normalizedHours ?? null,
                },
                update: {
                    ...(bio !== undefined && { bio }),
                    ...(intentionStatement !== undefined && { intentionStatement }),
                    ...(discord !== undefined && { discord }),
                    ...(whatsapp !== undefined && { whatsapp }),
                    ...(isAvailable !== undefined && { isAvailable }),
                    ...(normalizedHours !== undefined && { hoursPerWeek: normalizedHours }),
                },
            });

            if (selectedSkills) {
                await tx.contributorSkill.deleteMany({
                    where: { contributorId: profile.id },
                });

                if (selectedSkills.length > 0) {
                    await tx.contributorSkill.createMany({
                        data: selectedSkills.map((skillId) => ({
                            contributorId: profile.id,
                            skillId,
                            level: "INTERMEDIATE",
                        })),
                    });
                }
            }

            return profile;
        });

        return NextResponse.json({ success: true, profile: updatedProfile });
    }, ctx);
}
