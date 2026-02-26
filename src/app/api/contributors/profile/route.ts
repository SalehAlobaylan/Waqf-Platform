import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: Request) {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { bio, intentionStatement, discord, whatsapp, isAvailable, hoursPerWeek, selectedSkills } = body;
        const userId = session.user.id;

        // Update basic profile fields
        const updatedProfile = await prisma.contributorProfile.update({
            where: { userId },
            data: {
                bio,
                intentionStatement,
                discord,
                whatsapp,
                isAvailable,
                hoursPerWeek: hoursPerWeek ? parseInt(hoursPerWeek) : null,
            }
        });

        // Update skills if provided
        if (selectedSkills && Array.isArray(selectedSkills)) {
            // Remove existing skills
            await prisma.contributorSkill.deleteMany({
                where: { contributorId: updatedProfile.id }
            });

            // Need to insert new skills
            if (selectedSkills.length > 0) {
                await prisma.contributorSkill.createMany({
                    data: selectedSkills.map(skillId => ({
                        contributorId: updatedProfile.id,
                        skillId,
                        level: "INTERMEDIATE" // default level for now
                    }))
                });
            }
        }

        return NextResponse.json({ success: true, profile: updatedProfile });
    } catch (error) {
        console.error("Update profile API error:", error);
        return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
    }
}
