import { NextRequest, NextResponse } from "next/server";
import { UTApi } from "uploadthing/server";
import { requireAuthOrThrow } from "@/lib/auth-helpers";
import { withApiHandler, ApiHandlerContext } from "@/lib/api/handler";
import { AppError } from "@/lib/api/errors";
import { makeValidationError } from "@/lib/validation/errors";
import { checkRateLimit, rateLimitedResponse } from "@/lib/rate-limit";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB — keep in sync with uploadthing/core.ts

const utapi = new UTApi();

export async function POST(request: NextRequest) {
    const ctx: ApiHandlerContext = {};
    return withApiHandler(request, "api.upload", async () => {
        const user = await requireAuthOrThrow();
        ctx.userId = user.id;

        const today = new Date().toISOString().slice(0, 10);
        const rate = checkRateLimit(request, "upload", { limit: 20, windowMs: 24 * 60 * 60 * 1000 }, `${user.id}:${today}`);
        if (!rate.allowed) {
            return rateLimitedResponse(rate);
        }

        const formData = await request.formData();
        const file = formData.get("file") as File | null;

        if (!file) {
            return NextResponse.json(
                makeValidationError("No file provided", "file"),
                { status: 400 }
            );
        }

        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json(
                makeValidationError("File too large. Max 5MB.", "file"),
                { status: 400 }
            );
        }

        const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json(
                makeValidationError("Invalid file type. Allowed: JPEG, PNG, WebP, GIF", "file"),
                { status: 400 }
            );
        }

        const [upload] = await utapi.uploadFiles([file]);

        if (upload.error) {
            throw new AppError({ status: 500, code: "INTERNAL", message: "Failed to upload file" });
        }

        return NextResponse.json({ url: upload.data.url }, { status: 201 });
    }, ctx);
}
