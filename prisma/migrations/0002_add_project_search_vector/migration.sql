-- CreateTable
-- Add generated search_vector column for full-text search (roadmap §3.2)
ALTER TABLE "Project" ADD COLUMN "search_vector" tsvector;

-- Backfill existing rows (title, description, impact combined)
UPDATE "Project"
SET "search_vector" = to_tsvector('simple', coalesce("title", '') || ' ' || coalesce("description", '') || ' ' || coalesce("impact", ''));

-- GIN index for fast @@ queries
CREATE INDEX project_search_idx ON "Project" USING GIN ("search_vector");

-- Keep the vector in sync on insert/update of searchable columns
CREATE OR REPLACE FUNCTION project_search_vector_update() RETURNS trigger AS $$
BEGIN
  NEW."search_vector" := to_tsvector(
    'simple',
    coalesce(NEW."title", '') || ' ' || coalesce(NEW."description", '') || ' ' || coalesce(NEW."impact", '')
  );
  RETURN NEW;
END
$$ LANGUAGE plpgsql;

CREATE TRIGGER project_search_vector_trigger
BEFORE INSERT OR UPDATE OF "title", "description", "impact" ON "Project"
FOR EACH ROW EXECUTE FUNCTION project_search_vector_update();
