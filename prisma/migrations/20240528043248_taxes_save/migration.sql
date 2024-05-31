-- CreateTable
CREATE TABLE "TaxSaved" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "configId" INTEGER,
    CONSTRAINT "TaxSaved_configId_fkey" FOREIGN KEY ("configId") REFERENCES "Config" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TaxProductionSaved" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "value" REAL NOT NULL,
    "description" TEXT,
    "taxSavedId" INTEGER,
    CONSTRAINT "TaxProductionSaved_taxSavedId_fkey" FOREIGN KEY ("taxSavedId") REFERENCES "TaxSaved" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TaxHourlySaved" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "value" REAL NOT NULL,
    "description" TEXT,
    "taxSavedId" INTEGER,
    CONSTRAINT "TaxHourlySaved_taxSavedId_fkey" FOREIGN KEY ("taxSavedId") REFERENCES "TaxSaved" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Config" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "weekStartsOn" TEXT NOT NULL DEFAULT 'monday',
    "userId" TEXT,
    "taxSavedId" INTEGER,
    CONSTRAINT "Config_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Config" ("id", "userId", "weekStartsOn") SELECT "id", "userId", "weekStartsOn" FROM "Config";
DROP TABLE "Config";
ALTER TABLE "new_Config" RENAME TO "Config";
CREATE UNIQUE INDEX "Config_userId_key" ON "Config"("userId");
CREATE UNIQUE INDEX "Config_taxSavedId_key" ON "Config"("taxSavedId");
PRAGMA foreign_key_check("Config");
PRAGMA foreign_keys=ON;

-- CreateIndex
CREATE UNIQUE INDEX "TaxSaved_configId_key" ON "TaxSaved"("configId");
