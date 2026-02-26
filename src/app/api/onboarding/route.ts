import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

function slugifyString(text: string) {
    return text
        .toString()
        .toLowerCase()
        .replace(/\s+/g, "-")           // Replace spaces with -
        .replace(/[^\w\-]+/g, "")       // Remove all non-word chars
        .replace(/\-\-+/g, "-")         // Replace multiple - with single -
        .replace(/^-+/, "")             // Trim - from start of text
        .replace(/-+$/, "");            // Trim - from end of text
}

export async function POST(request: Request) {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { type, orgName } = body;

        const userId = session.user.id;

        if (type === "CONTRIBUTOR") {
            // Check if exists
            const existing = await prisma.contributorProfile.findUnique({ where: { userId } });
            if (existing) {
                return NextResponse.json({ error: "Profile already exists" }, { status: 400 });
            }

            await prisma.contributorProfile.create({
                data: {
                    userId,
                    isAvailable: true,
                }
            });

            return NextResponse.json({ success: true, type: "CONTRIBUTOR" });
        }

        if (type === "CREATOR") {
            if (!orgName) {
                return NextResponse.json({ error: "Organization name is required" }, { status: 400 });
            }

            // Check if exists
            const existing = await prisma.organization.findFirst({ where: { userId } });
            if (existing) {
                return NextResponse.json({ error: "Organization already exists" }, { status: 400 });
            }

            // Generate slug
            let baseSlug = slugifyString(orgName) || `org-${Date.now()}`;
            // check unique slug
            let slug = baseSlug;
            let counter = 1;
            while (await prisma.organization.findUnique({ where: { slug } })) {
                slug = `${baseSlug}-${counter}`;
                counter++;
            }

            await prisma.organization.create({
                data: {
                    userId,
                    name: orgName,
                    slug,
                }
            });

            return NextResponse.json({ success: true, type: "CREATOR" });
        }

        return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    } catch (error) {
        console.error("Onboarding API error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
