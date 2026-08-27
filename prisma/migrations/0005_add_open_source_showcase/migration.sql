-- Add showcase / open-source generic fields (first consumer: Islamic Digital Toolkit)
ALTER TABLE "Project" ADD COLUMN     "websiteUrl" TEXT;
ALTER TABLE "Project" ADD COLUMN     "isOpenSource" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Project" ADD COLUMN     "screenshots" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "Project" ADD COLUMN     "toolsPreview" JSONB;
ALTER TABLE "Project" ADD COLUMN     "cachedGithub" JSONB;

CREATE INDEX "Project_isOpenSource_status_idx" ON "Project"("isOpenSource", "status");
