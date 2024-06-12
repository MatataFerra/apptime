/*
  Warnings:

  - You are about to drop the column `taxSavedId` on the `Config` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Config" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "weekStartsOn" TEXT NOT NULL DEFAULT 'monday',
    "userId" TEXT,
    CONSTRAINT "Config_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Config" ("id", "userId", "weekStartsOn") SELECT "id", "userId", "weekStartsOn" FROM "Config";
DROP TABLE "Config";
ALTER TABLE "new_Config" RENAME TO "Config";
CREATE UNIQUE INDEX "Config_userId_key" ON "Config"("userId");
PRAGMA foreign_key_check("Config");
PRAGMA foreign_keys=ON;
