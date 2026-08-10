import { createUploadthing } from "uploadthing/next";
import type { FileRouter } from "uploadthing/next";
import { requireAuthOrThrow } from "@/lib/auth-helpers";

const f = createUploadthing();

export const ourFileRouter = {
    imageUploader: f({
        image: {
            maxFileSize: "8MB",
            maxFileCount: 1,
        },
    })
        .middleware(async () => {
            const user = await requireAuthOrThrow();
            return { userId: user.id };
        })
        .onUploadComplete(async ({ metadata, file }) => {
            return {
                url: file.url,
                userId: metadata.userId,
            };
        }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
