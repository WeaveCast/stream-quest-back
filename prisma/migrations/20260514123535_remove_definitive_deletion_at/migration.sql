/*
  Warnings:

  - You are about to drop the column `definitiveDeletionAt` on the `Campaign` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Campaign_definitiveDeletionAt_idx";

-- AlterTable
ALTER TABLE "Campaign" DROP COLUMN "definitiveDeletionAt";
