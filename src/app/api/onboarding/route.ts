import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuthOrThrow } from "@/lib/auth-helpers";
import { withApiHandler, ApiHandlerContext } from "@/lib/api/handler";
import { onboardingSchema } from "@/lib/validation/schemas";
import { parseBody } from "@/lib/validation/parse";
import { makeValidationError } from "@/lib/validation/errors";
import { checkRateLimit, rateLimitedResponse } from "@/lib/rate-limit";

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

export async function POST(request: NextRequest) {
    const ctx: ApiHandlerContext = {};
    return withApiHandler(request, "api.onboarding", async () => {
        const user = await requireAuthOrThrow();
        ctx.userId = user.id;

        const rate = checkRateLimit(request, "onboarding", { limit: 5, windowMs: 60_000 }, user.id);
        if (!rate.allowed) {
            return rateLimitedResponse(rate);
        }

        const parsedBody = await parseBody(request, onboardingSchema);
        if (!parsedBody.success) {
            return NextResponse.json(parsedBody.error, { status: 400 });
        }

        const { type, orgName } = parsedBody.data;

        const userId = user.id;

        if (type === "CONTRIBUTOR") {
            // Check if exists
            const existing = await prisma.contributorProfile.findUnique({ where: { userId } });
            if (existing) {
                return NextResponse.json(
                    makeValidationError("Profile already exists", "type"),
                    { status: 400 }
                );
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
                return NextResponse.json(
                    makeValidationError("Organization name is required", "orgName"),
                    { status: 400 }
                );
            }

            // Check if exists
            const existing = await prisma.organization.findFirst({ where: { userId } });
            if (existing) {
                return NextResponse.json(
                    makeValidationError("Organization already exists", "type"),
                    { status: 400 }
                );
            }

            // Generate slug
            const baseSlug = slugifyString(orgName) || `org-${Date.now()}`;
            // check unique slug
            let slug = baseSlug;
            let counter = 1;
            while (await prisma.organization.findUnique({ where: { slug } })) {
                slug = `${baseSlug}-${counter}`;
                counter++;
                if (counter > 50) {
                    return NextResponse.json(
                        makeValidationError("Unable to generate unique organization slug", "orgName"),
                        { status: 400 }
                    );
                }
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

        return NextResponse.json(makeValidationError("Invalid type", "type"), { status: 400 });
    }, ctx);
}
