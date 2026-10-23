-- Shifts can say who they were for. Optional: existing shifts stay unlinked,
-- and deleting an employer unlinks its shifts instead of deleting them.

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Hourly" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT,
    "startDate" TEXT NOT NULL,
    "endDate" TEXT,
    "amount" REAL,
    "isPublicHoliday" BOOLEAN NOT NULL DEFAULT false,
    "publicHolidayWorked" BOOLEAN NOT NULL DEFAULT false,
    "isClosed" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "hourValue" REAL NOT NULL,
    "unpaidBreaks" REAL,
    "currency" TEXT,
    "source" TEXT,
    "shiftId" INTEGER,
    "employerId" INTEGER,
    CONSTRAINT "Hourly_shiftId_fkey" FOREIGN KEY ("shiftId") REFERENCES "Shift" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Hourly_employerId_fkey" FOREIGN KEY ("employerId") REFERENCES "Employer" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Hourly" ("amount", "currency", "endDate", "hourValue", "id", "isClosed", "isPublicHoliday", "name", "notes", "publicHolidayWorked", "shiftId", "source", "startDate", "unpaidBreaks") SELECT "amount", "currency", "endDate", "hourValue", "id", "isClosed", "isPublicHoliday", "name", "notes", "publicHolidayWorked", "shiftId", "source", "startDate", "unpaidBreaks" FROM "Hourly";
DROP TABLE "Hourly";
ALTER TABLE "new_Hourly" RENAME TO "Hourly";
CREATE INDEX "Hourly_employerId_idx" ON "Hourly"("employerId");
CREATE TABLE "new_Production" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT,
    "startDate" TEXT NOT NULL,
    "endDate" TEXT,
    "amount" REAL,
    "isPublicHoliday" BOOLEAN NOT NULL DEFAULT false,
    "publicHolidayWorked" BOOLEAN NOT NULL DEFAULT false,
    "isClosed" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "itemValue" REAL,
    "itemQuantity" REAL,
    "currency" TEXT,
    "shiftId" INTEGER,
    "employerId" INTEGER,
    CONSTRAINT "Production_shiftId_fkey" FOREIGN KEY ("shiftId") REFERENCES "Shift" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Production_employerId_fkey" FOREIGN KEY ("employerId") REFERENCES "Employer" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Production" ("amount", "currency", "endDate", "id", "isClosed", "isPublicHoliday", "itemQuantity", "itemValue", "name", "notes", "publicHolidayWorked", "shiftId", "startDate") SELECT "amount", "currency", "endDate", "id", "isClosed", "isPublicHoliday", "itemQuantity", "itemValue", "name", "notes", "publicHolidayWorked", "shiftId", "startDate" FROM "Production";
DROP TABLE "Production";
ALTER TABLE "new_Production" RENAME TO "Production";
CREATE INDEX "Production_employerId_idx" ON "Production"("employerId");
PRAGMA foreign_key_check("Hourly");
PRAGMA foreign_key_check("Production");
PRAGMA foreign_keys=ON;
