/*
  Warnings:

  - You are about to drop the column `amount` on the `Shift` table. All the data in the column will be lost.
  - You are about to drop the column `endDate` on the `Shift` table. All the data in the column will be lost.
  - You are about to drop the column `holidayPay` on the `Shift` table. All the data in the column will be lost.
  - You are about to drop the column `holidayPayRate` on the `Shift` table. All the data in the column will be lost.
  - You are about to drop the column `hourValue` on the `Shift` table. All the data in the column will be lost.
  - You are about to drop the column `isClosed` on the `Shift` table. All the data in the column will be lost.
  - You are about to drop the column `isPublicHoliday` on the `Shift` table. All the data in the column will be lost.
  - You are about to drop the column `itemQuantity` on the `Shift` table. All the data in the column will be lost.
  - You are about to drop the column `itemValue` on the `Shift` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `Shift` table. All the data in the column will be lost.
  - You are about to drop the column `publicHolidayWorked` on the `Shift` table. All the data in the column will be lost.
  - You are about to drop the column `startDate` on the `Shift` table. All the data in the column will be lost.
  - You are about to drop the column `taxCode` on the `Shift` table. All the data in the column will be lost.
  - You are about to drop the column `typeShift` on the `Shift` table. All the data in the column will be lost.
  - You are about to drop the column `unpaidBreaks` on the `Shift` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "Production" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "startDate" TEXT NOT NULL,
    "endDate" TEXT,
    "amount" REAL,
    "isPublicHoliday" BOOLEAN NOT NULL DEFAULT false,
    "publicHolidayWorked" BOOLEAN NOT NULL DEFAULT false,
    "isClosed" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "itemValue" REAL,
    "itemQuantity" REAL,
    "holidayPay" BOOLEAN NOT NULL,
    "holidayPayRate" REAL,
    "taxCode" INTEGER DEFAULT 0,
    "shiftId" INTEGER,
    CONSTRAINT "Production_shiftId_fkey" FOREIGN KEY ("shiftId") REFERENCES "Shift" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Hourly" (
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
    "shiftId" INTEGER,
    CONSTRAINT "Hourly_shiftId_fkey" FOREIGN KEY ("shiftId") REFERENCES "Shift" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Tax" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "value" REAL NOT NULL,
    "description" TEXT,
    "hourlyId" INTEGER,
    "productionId" INTEGER,
    CONSTRAINT "Tax_productionId_fkey" FOREIGN KEY ("productionId") REFERENCES "Production" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Tax_hourlyId_fkey" FOREIGN KEY ("hourlyId") REFERENCES "Hourly" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Contribution" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "value" REAL NOT NULL,
    "description" TEXT,
    "hourlyId" INTEGER,
    "productionId" INTEGER,
    CONSTRAINT "Contribution_productionId_fkey" FOREIGN KEY ("productionId") REFERENCES "Production" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Contribution_hourlyId_fkey" FOREIGN KEY ("hourlyId") REFERENCES "Hourly" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Config" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "weekStartsOn" TEXT NOT NULL DEFAULT 'MONDAY',
    "userId" TEXT,
    CONSTRAINT "Config_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Shift" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" TEXT,
    CONSTRAINT "Shift_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Shift" ("id", "userId") SELECT "id", "userId" FROM "Shift";
DROP TABLE "Shift";
ALTER TABLE "new_Shift" RENAME TO "Shift";
CREATE UNIQUE INDEX "Shift_userId_key" ON "Shift"("userId");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

-- CreateIndex
CREATE UNIQUE INDEX "Config_userId_key" ON "Config"("userId");
