import { NextRequest, NextResponse } from "next/server";
import { UTApi } from "uploadthing/server";
import { requireAuthOrThrow } from "@/lib/auth-helpers";
import { withApiHandler, ApiHandlerContext } from "@/lib/api/handler";
import { AppError } from "@/lib/api/errors";
import { makeValidationError } from "@/lib/validation/errors";
import { checkRateLimit, rateLimitedResponse } from "@/lib/rate-limit";

const MAX_FILE_SIZE = 8 * 1024 * 1024; // 8MB — keep in sync with uploadthing/core.ts

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

/**
 * Sniffs the first bytes of a file to verify it is actually one of the allowed
 * image formats, rather than trusting the client-supplied `Content-Type`.
 * Returns a normalized MIME type on match, or null.
 */
function sniffImageType(bytes: Uint8Array): string | null {
    if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
        return "image/jpeg";
    }
    if (bytes.length >= 8 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47 &&
        bytes[4] === 0x0d && bytes[5] === 0x0a && bytes[6] === 0x1a && bytes[7] === 0x0a) {
        return "image/png";
    }
    // WebP: "RIFF" (52 49 46 46) .... "WEBP" (57 45 42 50) at offset 8
    if (bytes.length >= 12 && bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
        bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50) {
        return "image/webp";
    }
    // GIF: "GIF8" (47 49 46 38)
    if (bytes.length >= 6 && bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x38) {
        return "image/gif";
    }
    return null;
}

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
                makeValidationError("File too large. Max 8MB.", "file"),
                { status: 400 }
            );
        }

        if (!ALLOWED_TYPES.includes(file.type)) {
            return NextResponse.json(
                makeValidationError("Invalid file type. Allowed: JPEG, PNG, WebP, GIF", "file"),
                { status: 400 }
            );
        }

        // Verify actual content matches the declared type (MIME spoofing defense)
        const head = new Uint8Array(await file.slice(0, 16).arrayBuffer());
        const sniffed = sniffImageType(head);
        const declaredType = file.type === "image/jpg" ? "image/jpeg" : file.type;
        if (!sniffed || sniffed !== declaredType) {
            return NextResponse.json(
                makeValidationError("File content does not match its declared type", "file"),
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
