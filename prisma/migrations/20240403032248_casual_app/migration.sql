/*
  Warnings:

  - You are about to drop the column `endHour` on the `Profile` table. All the data in the column will be lost.
  - You are about to drop the column `extraNightShiftPay` on the `Profile` table. All the data in the column will be lost.
  - You are about to drop the column `holidayPay` on the `Profile` table. All the data in the column will be lost.
  - You are about to drop the column `holidayPayRate` on the `Profile` table. All the data in the column will be lost.
  - You are about to drop the column `hourlyRate` on the `Profile` table. All the data in the column will be lost.
  - You are about to drop the column `nightShift` on the `Profile` table. All the data in the column will be lost.
  - You are about to drop the column `startHour` on the `Profile` table. All the data in the column will be lost.
  - You are about to drop the column `unpaidBreaks` on the `Profile` table. All the data in the column will be lost.
  - Added the required column `firstName` to the `Profile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `holidayPay` to the `Shift` table without a default value. This is not possible if the table is not empty.
  - Added the required column `hourValue` to the `Shift` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Profile" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT,
    "address" TEXT,
    "city" TEXT,
    "country" TEXT,
    "userId" TEXT,
    CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Profile" ("id", "userId") SELECT "id", "userId" FROM "Profile";
DROP TABLE "Profile";
ALTER TABLE "new_Profile" RENAME TO "Profile";
CREATE UNIQUE INDEX "Profile_userId_key" ON "Profile"("userId");
CREATE TABLE "new_Shift" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "startDate" TEXT NOT NULL,
    "endDate" TEXT,
    "amount" REAL,
    "isPublicHoliday" BOOLEAN NOT NULL DEFAULT false,
    "publicHolidayWorked" BOOLEAN NOT NULL DEFAULT false,
    "isClosed" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "hourValue" REAL NOT NULL,
    "holidayPay" BOOLEAN NOT NULL,
    "holidayPayRate" REAL,
    "unpaidBreaks" REAL,
    "taxCode" INTEGER DEFAULT 0,
    "userId" TEXT,
    CONSTRAINT "Shift_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Shift" ("amount", "endDate", "id", "isClosed", "isPublicHoliday", "notes", "publicHolidayWorked", "startDate", "userId") SELECT "amount", "endDate", "id", "isClosed", "isPublicHoliday", "notes", "publicHolidayWorked", "startDate", "userId" FROM "Shift";
DROP TABLE "Shift";
ALTER TABLE "new_Shift" RENAME TO "Shift";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
