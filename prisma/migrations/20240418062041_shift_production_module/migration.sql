-- RedefineTables
PRAGMA foreign_keys=OFF;
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
    "itemValue" REAL,
    "itemQuantity" REAL,
    "holidayPay" BOOLEAN NOT NULL,
    "holidayPayRate" REAL,
    "unpaidBreaks" REAL,
    "taxCode" INTEGER DEFAULT 0,
    "typeShift" TEXT NOT NULL DEFAULT 'TRACK',
    "userId" TEXT,
    CONSTRAINT "Shift_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Shift" ("amount", "endDate", "holidayPay", "holidayPayRate", "hourValue", "id", "isClosed", "isPublicHoliday", "notes", "publicHolidayWorked", "startDate", "taxCode", "unpaidBreaks", "userId") SELECT "amount", "endDate", "holidayPay", "holidayPayRate", "hourValue", "id", "isClosed", "isPublicHoliday", "notes", "publicHolidayWorked", "startDate", "taxCode", "unpaidBreaks", "userId" FROM "Shift";
DROP TABLE "Shift";
ALTER TABLE "new_Shift" RENAME TO "Shift";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
