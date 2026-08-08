import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { UTApi } from "uploadthing/server";
import { makeValidationError } from "@/lib/validation/errors";
import { checkRateLimit, rateLimitedResponse } from "@/lib/rate-limit";

const utapi = new UTApi();

export async function POST(request: NextRequest) {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Authentication required" }, { status: 401 });
        }

        const today = new Date().toISOString().slice(0, 10);
        if (!checkRateLimit(request, "upload", { limit: 20, windowMs: 24 * 60 * 60 * 1000 }, `${session.user.id}:${today}`)) {
            return rateLimitedResponse();
        }

        const formData = await request.formData();
        const file = formData.get("file") as File | null;

        if (!file) {
            return NextResponse.json(
                makeValidationError("No file provided", "file"),
                { status: 400 }
            );
        }

        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json(
                makeValidationError("File too large. Max 5MB.", "file"),
                { status: 400 }
            );
        }

        // Validate file type
        const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json(
                makeValidationError("Invalid file type. Allowed: JPEG, PNG, WebP, GIF", "file"),
                { status: 400 }
            );
        }

        const [upload] = await utapi.uploadFiles([file]);

        if (upload.error) {
            return NextResponse.json(
                { error: "Failed to upload file" },
                { status: 500 }
            );
        }

        return NextResponse.json({ url: upload.data.url }, { status: 201 });
    } catch (error) {
        console.error("[API] Upload error:", error);
        return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
    }
}
