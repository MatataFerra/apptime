/*
  Warnings:

  - You are about to drop the column `hourlyId` on the `Contribution` table. All the data in the column will be lost.
  - You are about to drop the column `productionId` on the `Contribution` table. All the data in the column will be lost.
  - You are about to drop the column `hourlyId` on the `Tax` table. All the data in the column will be lost.
  - You are about to drop the column `productionId` on the `Tax` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "_ProductionToTax" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_ProductionToTax_A_fkey" FOREIGN KEY ("A") REFERENCES "Production" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_ProductionToTax_B_fkey" FOREIGN KEY ("B") REFERENCES "Tax" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_HourlyToTax" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_HourlyToTax_A_fkey" FOREIGN KEY ("A") REFERENCES "Hourly" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_HourlyToTax_B_fkey" FOREIGN KEY ("B") REFERENCES "Tax" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_ContributionToProduction" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_ContributionToProduction_A_fkey" FOREIGN KEY ("A") REFERENCES "Contribution" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_ContributionToProduction_B_fkey" FOREIGN KEY ("B") REFERENCES "Production" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_ContributionToHourly" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_ContributionToHourly_A_fkey" FOREIGN KEY ("A") REFERENCES "Contribution" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_ContributionToHourly_B_fkey" FOREIGN KEY ("B") REFERENCES "Hourly" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Contribution" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "value" REAL NOT NULL,
    "description" TEXT
);
INSERT INTO "new_Contribution" ("description", "id", "name", "value") SELECT "description", "id", "name", "value" FROM "Contribution";
DROP TABLE "Contribution";
ALTER TABLE "new_Contribution" RENAME TO "Contribution";
CREATE TABLE "new_Tax" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "value" REAL NOT NULL,
    "description" TEXT
);
INSERT INTO "new_Tax" ("description", "id", "name", "value") SELECT "description", "id", "name", "value" FROM "Tax";
DROP TABLE "Tax";
ALTER TABLE "new_Tax" RENAME TO "Tax";
PRAGMA foreign_key_check("Contribution");
PRAGMA foreign_key_check("Tax");
PRAGMA foreign_keys=ON;

-- CreateIndex
CREATE UNIQUE INDEX "_ProductionToTax_AB_unique" ON "_ProductionToTax"("A", "B");

-- CreateIndex
CREATE INDEX "_ProductionToTax_B_index" ON "_ProductionToTax"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_HourlyToTax_AB_unique" ON "_HourlyToTax"("A", "B");

-- CreateIndex
CREATE INDEX "_HourlyToTax_B_index" ON "_HourlyToTax"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_ContributionToProduction_AB_unique" ON "_ContributionToProduction"("A", "B");

-- CreateIndex
CREATE INDEX "_ContributionToProduction_B_index" ON "_ContributionToProduction"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_ContributionToHourly_AB_unique" ON "_ContributionToHourly"("A", "B");

-- CreateIndex
CREATE INDEX "_ContributionToHourly_B_index" ON "_ContributionToHourly"("B");
