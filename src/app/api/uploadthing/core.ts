import { createUploadthing } from "uploadthing/next";
import type { FileRouter } from "uploadthing/next";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

const f = createUploadthing();

export const ourFileRouter = {
    imageUploader: f({
        image: {
            maxFileSize: "4MB",
            maxFileCount: 1,
        },
    })
        .middleware(async () => {
            const session = await auth.api.getSession({ headers: await headers() });
            if (!session?.user?.id) {
                throw new Error("Unauthorized");
            }
            return { userId: session.user.id };
        })
        .onUploadComplete(async ({ metadata, file }) => {
            return {
                url: file.url,
                userId: metadata.userId,
            };
        }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
