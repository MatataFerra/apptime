-- Taxes and contributions per user.
-- Until now a row was shared by name across all users, so one user's shift
-- could point at another user's "Income tax" with a different rate.

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Tax" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "value" REAL NOT NULL,
    "description" TEXT,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT,
    CONSTRAINT "Tax_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Tax" ("description", "id", "name", "value") SELECT "description", "id", "name", "value" FROM "Tax";
DROP TABLE "Tax";
ALTER TABLE "new_Tax" RENAME TO "Tax";
CREATE INDEX "Tax_userId_idx" ON "Tax"("userId");
CREATE TABLE "new_Contribution" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "value" REAL NOT NULL,
    "description" TEXT,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT,
    CONSTRAINT "Contribution_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Contribution" ("description", "id", "name", "value") SELECT "description", "id", "name", "value" FROM "Contribution";
DROP TABLE "Contribution";
ALTER TABLE "new_Contribution" RENAME TO "Contribution";
CREATE INDEX "Contribution_userId_idx" ON "Contribution"("userId");
PRAGMA foreign_key_check("Tax");
PRAGMA foreign_key_check("Contribution");
PRAGMA foreign_keys=ON;

-- Data: split shared rows

-- Tax: give every row to the user whose shifts use it. A row used by several
-- users stays with the first and is copied for each of the others; their
-- shifts are moved to their own copy. Same name, rate and note: amounts don't change.
CREATE TABLE "_Tax_use" AS
    SELECT j."B" AS "itemId", s."userId" AS "userId"
    FROM "_HourlyToTax" j
    JOIN "Hourly" h ON h."id" = j."A"
    JOIN "Shift" s ON s."id" = h."shiftId"
    WHERE s."userId" IS NOT NULL
    UNION
    SELECT j."B", s."userId"
    FROM "_ProductionToTax" j
    JOIN "Production" p ON p."id" = j."A"
    JOIN "Shift" s ON s."id" = p."shiftId"
    WHERE s."userId" IS NOT NULL;

UPDATE "Tax" SET "userId" = (
    SELECT MIN(u."userId") FROM "_Tax_use" u WHERE u."itemId" = "Tax"."id"
);

CREATE TABLE "_Tax_max" AS SELECT COALESCE(MAX("id"), 0) AS "maxId" FROM "Tax";

INSERT INTO "Tax" ("name", "value", "description", "userId")
    SELECT o."name", o."value", o."description", u."userId"
    FROM "_Tax_use" u
    JOIN "Tax" o ON o."id" = u."itemId"
    WHERE u."userId" <> o."userId"
    ORDER BY o."id", u."userId";

UPDATE "_HourlyToTax" SET "B" = (
    SELECT MIN(c."id") FROM "Tax" c, "Tax" o, "Hourly" h, "Shift" s
    WHERE o."id" = "_HourlyToTax"."B"
      AND h."id" = "_HourlyToTax"."A"
      AND s."id" = h."shiftId"
      AND c."id" > (SELECT "maxId" FROM "_Tax_max")
      AND c."userId" = s."userId"
      AND c."name" = o."name" AND c."value" = o."value" AND c."description" IS o."description"
)
WHERE EXISTS (
    SELECT 1 FROM "Hourly" h
    JOIN "Shift" s ON s."id" = h."shiftId"
    JOIN "Tax" o ON o."id" = "_HourlyToTax"."B"
    WHERE h."id" = "_HourlyToTax"."A" AND s."userId" <> o."userId"
);

UPDATE "_ProductionToTax" SET "B" = (
    SELECT MIN(c."id") FROM "Tax" c, "Tax" o, "Production" p, "Shift" s
    WHERE o."id" = "_ProductionToTax"."B"
      AND p."id" = "_ProductionToTax"."A"
      AND s."id" = p."shiftId"
      AND c."id" > (SELECT "maxId" FROM "_Tax_max")
      AND c."userId" = s."userId"
      AND c."name" = o."name" AND c."value" = o."value" AND c."description" IS o."description"
)
WHERE EXISTS (
    SELECT 1 FROM "Production" p
    JOIN "Shift" s ON s."id" = p."shiftId"
    JOIN "Tax" o ON o."id" = "_ProductionToTax"."B"
    WHERE p."id" = "_ProductionToTax"."A" AND s."userId" <> o."userId"
);

DROP TABLE "_Tax_use";
DROP TABLE "_Tax_max";

-- Contribution: give every row to the user whose shifts use it. A row used by several
-- users stays with the first and is copied for each of the others; their
-- shifts are moved to their own copy. Same name, rate and note: amounts don't change.
CREATE TABLE "_Contribution_use" AS
    SELECT j."A" AS "itemId", s."userId" AS "userId"
    FROM "_ContributionToHourly" j
    JOIN "Hourly" h ON h."id" = j."B"
    JOIN "Shift" s ON s."id" = h."shiftId"
    WHERE s."userId" IS NOT NULL
    UNION
    SELECT j."A", s."userId"
    FROM "_ContributionToProduction" j
    JOIN "Production" p ON p."id" = j."B"
    JOIN "Shift" s ON s."id" = p."shiftId"
    WHERE s."userId" IS NOT NULL;

UPDATE "Contribution" SET "userId" = (
    SELECT MIN(u."userId") FROM "_Contribution_use" u WHERE u."itemId" = "Contribution"."id"
);

CREATE TABLE "_Contribution_max" AS SELECT COALESCE(MAX("id"), 0) AS "maxId" FROM "Contribution";

INSERT INTO "Contribution" ("name", "value", "description", "userId")
    SELECT o."name", o."value", o."description", u."userId"
    FROM "_Contribution_use" u
    JOIN "Contribution" o ON o."id" = u."itemId"
    WHERE u."userId" <> o."userId"
    ORDER BY o."id", u."userId";

UPDATE "_ContributionToHourly" SET "A" = (
    SELECT MIN(c."id") FROM "Contribution" c, "Contribution" o, "Hourly" h, "Shift" s
    WHERE o."id" = "_ContributionToHourly"."A"
      AND h."id" = "_ContributionToHourly"."B"
      AND s."id" = h."shiftId"
      AND c."id" > (SELECT "maxId" FROM "_Contribution_max")
      AND c."userId" = s."userId"
      AND c."name" = o."name" AND c."value" = o."value" AND c."description" IS o."description"
)
WHERE EXISTS (
    SELECT 1 FROM "Hourly" h
    JOIN "Shift" s ON s."id" = h."shiftId"
    JOIN "Contribution" o ON o."id" = "_ContributionToHourly"."A"
    WHERE h."id" = "_ContributionToHourly"."B" AND s."userId" <> o."userId"
);

UPDATE "_ContributionToProduction" SET "A" = (
    SELECT MIN(c."id") FROM "Contribution" c, "Contribution" o, "Production" p, "Shift" s
    WHERE o."id" = "_ContributionToProduction"."A"
      AND p."id" = "_ContributionToProduction"."B"
      AND s."id" = p."shiftId"
      AND c."id" > (SELECT "maxId" FROM "_Contribution_max")
      AND c."userId" = s."userId"
      AND c."name" = o."name" AND c."value" = o."value" AND c."description" IS o."description"
)
WHERE EXISTS (
    SELECT 1 FROM "Production" p
    JOIN "Shift" s ON s."id" = p."shiftId"
    JOIN "Contribution" o ON o."id" = "_ContributionToProduction"."A"
    WHERE p."id" = "_ContributionToProduction"."B" AND s."userId" <> o."userId"
);

DROP TABLE "_Contribution_use";
DROP TABLE "_Contribution_max";
