/*
  Warnings:

  - You are about to drop the column `taxCode` on the `Hourly` table. All the data in the column will be lost.
  - You are about to drop the column `taxCode` on the `Production` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Hourly" (
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
    "shiftId" INTEGER,
    CONSTRAINT "Hourly_shiftId_fkey" FOREIGN KEY ("shiftId") REFERENCES "Shift" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Hourly" ("amount", "endDate", "holidayPay", "holidayPayRate", "hourValue", "id", "isClosed", "isPublicHoliday", "notes", "publicHolidayWorked", "shiftId", "startDate", "unpaidBreaks") SELECT "amount", "endDate", "holidayPay", "holidayPayRate", "hourValue", "id", "isClosed", "isPublicHoliday", "notes", "publicHolidayWorked", "shiftId", "startDate", "unpaidBreaks" FROM "Hourly";
DROP TABLE "Hourly";
ALTER TABLE "new_Hourly" RENAME TO "Hourly";
CREATE TABLE "new_Production" (
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
    "shiftId" INTEGER,
    CONSTRAINT "Production_shiftId_fkey" FOREIGN KEY ("shiftId") REFERENCES "Shift" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Production" ("amount", "endDate", "holidayPay", "holidayPayRate", "id", "isClosed", "isPublicHoliday", "itemQuantity", "itemValue", "notes", "publicHolidayWorked", "shiftId", "startDate") SELECT "amount", "endDate", "holidayPay", "holidayPayRate", "id", "isClosed", "isPublicHoliday", "itemQuantity", "itemValue", "notes", "publicHolidayWorked", "shiftId", "startDate" FROM "Production";
DROP TABLE "Production";
ALTER TABLE "new_Production" RENAME TO "Production";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
