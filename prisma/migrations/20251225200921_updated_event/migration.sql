/*
  Warnings:

  - You are about to drop the column `orgId` on the `events` table. All the data in the column will be lost.
  - You are about to drop the column `properties` on the `events` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `events` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[visitorsId]` on the table `events` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[sessionId]` on the table `events` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `browser` to the `events` table without a default value. This is not possible if the table is not empty.
  - Added the required column `device` to the `events` table without a default value. This is not possible if the table is not empty.
  - Added the required column `os` to the `events` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pageTitle` to the `events` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pageUrl` to the `events` table without a default value. This is not possible if the table is not empty.
  - Added the required column `projectId` to the `events` table without a default value. This is not possible if the table is not empty.
  - Added the required column `refferrer` to the `events` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sessionId` to the `events` table without a default value. This is not possible if the table is not empty.
  - Added the required column `visitorsId` to the `events` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Device" AS ENUM ('mobile', 'desktop', 'tablet');

-- DropForeignKey
ALTER TABLE "events" DROP CONSTRAINT "events_orgId_fkey";

-- DropIndex
DROP INDEX "events_orgId_deleted_idx";

-- DropIndex
DROP INDEX "events_orgId_eventName_idx";

-- DropIndex
DROP INDEX "events_orgId_timestamp_idx";

-- AlterTable
ALTER TABLE "events" DROP COLUMN "orgId",
DROP COLUMN "properties",
DROP COLUMN "userId",
ADD COLUMN     "browser" TEXT NOT NULL,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "country" TEXT,
ADD COLUMN     "device" "Device" NOT NULL,
ADD COLUMN     "eventData" JSONB,
ADD COLUMN     "ipAddress" INTEGER,
ADD COLUMN     "os" TEXT NOT NULL,
ADD COLUMN     "pageTitle" TEXT NOT NULL,
ADD COLUMN     "pageUrl" TEXT NOT NULL,
ADD COLUMN     "projectId" TEXT NOT NULL,
ADD COLUMN     "refferrer" TEXT NOT NULL,
ADD COLUMN     "sessionId" TEXT NOT NULL,
ADD COLUMN     "userAgent" TEXT,
ADD COLUMN     "visitorsId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "events_visitorsId_key" ON "events"("visitorsId");

-- CreateIndex
CREATE UNIQUE INDEX "events_sessionId_key" ON "events"("sessionId");

-- CreateIndex
CREATE INDEX "events_projectId_timestamp_idx" ON "events"("projectId", "timestamp" DESC);

-- CreateIndex
CREATE INDEX "events_projectId_eventName_idx" ON "events"("projectId", "eventName");

-- CreateIndex
CREATE INDEX "events_projectId_deleted_idx" ON "events"("projectId", "deleted");

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
