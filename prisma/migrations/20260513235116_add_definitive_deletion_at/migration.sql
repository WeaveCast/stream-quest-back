-- AlterTable
ALTER TABLE "Campaign" ADD COLUMN     "definitiveDeletionAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Campaign_definitiveDeletionAt_idx" ON "Campaign"("definitiveDeletionAt");
