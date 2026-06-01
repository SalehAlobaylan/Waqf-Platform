import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { makeValidationError } from "@/lib/validation/errors";

export async function POST(request: NextRequest) {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Authentication required" }, { status: 401 });
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

        // Create uploads directory if it doesn't exist
        const uploadsDir = path.join(process.cwd(), "public", "uploads");
        await mkdir(uploadsDir, { recursive: true });

        // Generate unique filename
        const ext = file.name.split(".").pop() || "jpg";
        const filename = `${session.user.id}-${Date.now()}.${ext}`;
        const filepath = path.join(uploadsDir, filename);

        // Write file
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        await writeFile(filepath, buffer);

        const url = `/uploads/${filename}`;

        return NextResponse.json({ url }, { status: 201 });
    } catch (error) {
        console.error("[API] Upload error:", error);
        return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
    }
}
