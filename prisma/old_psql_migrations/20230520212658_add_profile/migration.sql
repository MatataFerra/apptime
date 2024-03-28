/*
  Warnings:

  - You are about to drop the column `endHour` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `extraNightShiftPay` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `holidayPay` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `holidayPayRate` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `hourlyRate` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `nightShift` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `startHour` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `unpaidBreaks` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "endHour",
DROP COLUMN "extraNightShiftPay",
DROP COLUMN "holidayPay",
DROP COLUMN "holidayPayRate",
DROP COLUMN "hourlyRate",
DROP COLUMN "nightShift",
DROP COLUMN "startHour",
DROP COLUMN "unpaidBreaks";

-- CreateTable
CREATE TABLE "Profile" (
    "id" SERIAL NOT NULL,
    "hourlyRate" DOUBLE PRECISION NOT NULL,
    "startHour" DOUBLE PRECISION NOT NULL,
    "endHour" DOUBLE PRECISION NOT NULL,
    "nightShift" BOOLEAN NOT NULL,
    "extraNightShiftPay" DOUBLE PRECISION,
    "holidayPay" BOOLEAN NOT NULL,
    "holidayPayRate" DOUBLE PRECISION,
    "unpaidBreaks" DOUBLE PRECISION,
    "userId" INTEGER,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Profile_userId_key" ON "Profile"("userId");

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
