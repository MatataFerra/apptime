/*
  Warnings:

  - You are about to drop the `TaxHourlySaved` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TaxProductionSaved` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TaxSaved` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "TaxHourlySaved";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "TaxProductionSaved";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "TaxSaved";
PRAGMA foreign_keys=on;
