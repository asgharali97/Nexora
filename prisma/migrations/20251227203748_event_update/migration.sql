/*
  Warnings:

  - You are about to drop the column `key` on the `api_keys` table. All the data in the column will be lost.
  - You are about to drop the column `projectId` on the `events` table. All the data in the column will be lost.
  - You are about to drop the column `timestamp` on the `events` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[hashKey]` on the table `api_keys` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `hashKey` to the `api_keys` table without a default value. This is not possible if the table is not empty.
  - Added the required column `orgId` to the `events` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "events" DROP CONSTRAINT "events_projectId_fkey";

-- DropIndex
DROP INDEX "api_keys_key_idx";

-- DropIndex
DROP INDEX "api_keys_key_key";

-- DropIndex
DROP INDEX "events_projectId_deleted_idx";

-- DropIndex
DROP INDEX "events_projectId_eventName_idx";

-- DropIndex
DROP INDEX "events_projectId_timestamp_idx";

-- DropIndex
DROP INDEX "events_sessionId_key";

-- DropIndex
DROP INDEX "events_visitorsId_key";

-- AlterTable
ALTER TABLE "api_keys" DROP COLUMN "key",
ADD COLUMN     "hashKey" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "events" DROP COLUMN "projectId",
DROP COLUMN "timestamp",
ADD COLUMN     "clientTimestamp" TIMESTAMP(3),
ADD COLUMN     "orgId" TEXT NOT NULL,
ADD COLUMN     "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "browser" DROP NOT NULL,
ALTER COLUMN "device" SET DEFAULT 'desktop',
ALTER COLUMN "os" DROP NOT NULL,
ALTER COLUMN "pageTitle" DROP NOT NULL,
ALTER COLUMN "pageUrl" DROP NOT NULL,
ALTER COLUMN "refferrer" DROP NOT NULL,
ALTER COLUMN "sessionId" DROP NOT NULL,
ALTER COLUMN "visitorsId" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "api_keys_hashKey_key" ON "api_keys"("hashKey");

-- CreateIndex
CREATE INDEX "api_keys_hashKey_idx" ON "api_keys"("hashKey");

-- CreateIndex
CREATE INDEX "events_orgId_receivedAt_idx" ON "events"("orgId", "receivedAt");

-- CreateIndex
CREATE INDEX "events_orgId_eventName_idx" ON "events"("orgId", "eventName");

-- CreateIndex
CREATE INDEX "events_orgId_visitorsId_idx" ON "events"("orgId", "visitorsId");

-- CreateIndex
CREATE INDEX "events_orgId_sessionId_idx" ON "events"("orgId", "sessionId");

-- CreateIndex
CREATE INDEX "events_visitorsId_idx" ON "events"("visitorsId");

-- CreateIndex
CREATE INDEX "events_sessionId_idx" ON "events"("sessionId");

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
