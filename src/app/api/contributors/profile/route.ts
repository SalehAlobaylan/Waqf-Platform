import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { profileUpdateSchema } from "@/lib/validation/schemas";
import { parseBody } from "@/lib/validation/parse";

export async function PATCH(request: Request) {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const parsedBody = await parseBody(request, profileUpdateSchema);
        if (!parsedBody.success) {
            return NextResponse.json(parsedBody.error, { status: 400 });
        }

        const { bio, intentionStatement, discord, whatsapp, isAvailable, hoursPerWeek, selectedSkills } = parsedBody.data;
        const userId = session.user.id;

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
    } catch (error) {
        console.error("Update profile API error:", error);
        return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
    }
}
