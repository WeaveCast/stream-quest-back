-- AlterTable
ALTER TABLE "Campaign" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Campaign_gameMasterId_idx" ON "Campaign"("gameMasterId");

-- CreateIndex
CREATE INDEX "Campaign_status_idx" ON "Campaign"("status");

-- CreateIndex
CREATE INDEX "Campaign_deletedAt_idx" ON "Campaign"("deletedAt");

-- CreateIndex
CREATE INDEX "CampaignEvent_campaignId_idx" ON "CampaignEvent"("campaignId");

-- CreateIndex
CREATE INDEX "CampaignEvent_eventId_idx" ON "CampaignEvent"("eventId");

-- CreateIndex
CREATE INDEX "CampaignEvent_isActive_idx" ON "CampaignEvent"("isActive");

-- CreateIndex
CREATE INDEX "Event_gameMasterId_idx" ON "Event"("gameMasterId");

-- CreateIndex
CREATE INDEX "Event_eventTypeId_idx" ON "Event"("eventTypeId");

-- CreateIndex
CREATE INDEX "KarmaEvent_campaignId_occurredAt_idx" ON "KarmaEvent"("campaignId", "occurredAt");

-- CreateIndex
CREATE INDEX "KarmaEvent_sessionId_occurredAt_idx" ON "KarmaEvent"("sessionId", "occurredAt");

-- CreateIndex
CREATE INDEX "PlayerCharacter_campaignId_idx" ON "PlayerCharacter"("campaignId");

-- CreateIndex
CREATE INDEX "PlayerCharacter_isAlive_idx" ON "PlayerCharacter"("isAlive");

-- CreateIndex
CREATE INDEX "Rule_eventId_idx" ON "Rule"("eventId");

-- CreateIndex
CREATE INDEX "Rule_isActive_idx" ON "Rule"("isActive");

-- CreateIndex
CREATE INDEX "Session_campaignId_idx" ON "Session"("campaignId");

-- CreateIndex
CREATE INDEX "Session_status_idx" ON "Session"("status");

-- CreateIndex
CREATE INDEX "SessionEvent_sessionId_idx" ON "SessionEvent"("sessionId");

-- CreateIndex
CREATE INDEX "SessionEvent_status_idx" ON "SessionEvent"("status");

-- CreateIndex
CREATE INDEX "ViewerInteraction_campaignId_idx" ON "ViewerInteraction"("campaignId");

-- CreateIndex
CREATE INDEX "ViewerInteraction_sessionId_idx" ON "ViewerInteraction"("sessionId");

-- CreateIndex
CREATE INDEX "ViewerInteraction_twitchUserId_idx" ON "ViewerInteraction"("twitchUserId");

-- CreateIndex
CREATE INDEX "ViewerInteraction_interactedAt_idx" ON "ViewerInteraction"("interactedAt");
