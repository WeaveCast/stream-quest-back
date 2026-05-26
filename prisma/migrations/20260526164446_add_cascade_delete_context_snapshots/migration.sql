-- DropForeignKey
ALTER TABLE "ContextSnapshot" DROP CONSTRAINT "ContextSnapshot_sessionId_fkey";

-- AddForeignKey
ALTER TABLE "ContextSnapshot" ADD CONSTRAINT "ContextSnapshot_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE CASCADE ON UPDATE CASCADE;
