-- Add missing FK-shaped indexes for per-user hot paths:
--   Project.ownerId        (owner dashboards, "my projects")
--   Application.contributorId ("my applications")
--   CampaignJoin.contributorId (campaign-joins dashboard)
-- Campaign.ownerId already indexed since 0001; these were omitted there.

CREATE INDEX IF NOT EXISTS "Project_ownerId_idx" ON "Project"("ownerId");
CREATE INDEX IF NOT EXISTS "Application_contributorId_idx" ON "Application"("contributorId");
CREATE INDEX IF NOT EXISTS "CampaignJoin_contributorId_idx" ON "CampaignJoin"("contributorId");
