/*
  Warnings:

  - You are about to drop the column `refferrer` on the `events` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "events" DROP COLUMN "refferrer",
ADD COLUMN     "referrer" TEXT;
