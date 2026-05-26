/*
  Warnings:

  - You are about to drop the column `location` on the `ContextSnapshot` table. All the data in the column will be lost.
  - You are about to drop the column `weather` on the `ContextSnapshot` table. All the data in the column will be lost.
  - The `timeOfDay` column on the `ContextSnapshot` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "TimeOfDay" AS ENUM ('DAWN', 'DAY', 'DUSK', 'NIGHT');

-- AlterTable
ALTER TABLE "ContextSnapshot" DROP COLUMN "location",
DROP COLUMN "weather",
ADD COLUMN     "locationId" TEXT,
ADD COLUMN     "weatherId" TEXT,
DROP COLUMN "timeOfDay",
ADD COLUMN     "timeOfDay" "TimeOfDay";

-- CreateTable
CREATE TABLE "Weather" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "description" TEXT,
    "iconUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Weather_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Location" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Weather_name_key" ON "Weather"("name");

-- CreateIndex
CREATE INDEX "Weather_name_idx" ON "Weather"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Location_name_key" ON "Location"("name");

-- CreateIndex
CREATE INDEX "Location_name_idx" ON "Location"("name");

-- CreateIndex
CREATE INDEX "ContextSnapshot_sessionId_idx" ON "ContextSnapshot"("sessionId");

-- CreateIndex
CREATE INDEX "ContextSnapshot_weatherId_idx" ON "ContextSnapshot"("weatherId");

-- CreateIndex
CREATE INDEX "ContextSnapshot_locationId_idx" ON "ContextSnapshot"("locationId");

-- AddForeignKey
ALTER TABLE "ContextSnapshot" ADD CONSTRAINT "ContextSnapshot_weatherId_fkey" FOREIGN KEY ("weatherId") REFERENCES "Weather"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContextSnapshot" ADD CONSTRAINT "ContextSnapshot_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;
