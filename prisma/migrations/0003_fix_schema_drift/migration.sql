-- Repair schema drift on databases created before these changes existed.

-- 1) User.role was created as `text` on drifted databases; promote it to the
--    UserRole enum without losing data (all stored values are valid labels).
--    The existing `'USER'::text` default must be dropped before the type change.
ALTER TABLE "User" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "role" SET DATA TYPE "UserRole" USING ("role"::"UserRole");
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'USER'::"UserRole";

-- 2) Message indexes declared in the schema are missing on drifted databases.
CREATE INDEX IF NOT EXISTS "Message_applicationId_idx" ON "Message"("applicationId");
CREATE INDEX IF NOT EXISTS "Message_senderId_idx" ON "Message"("senderId");

-- 3) Re-ensure the full-text search index in case a `prisma db push` dropped it.
--    Prisma cannot model this index (GIN index over a tsvector/Unsupported column,
--    backed by a trigger-managed function), so it is owned by migration 0002.
CREATE INDEX IF NOT EXISTS project_search_idx ON "Project" USING GIN ("search_vector");