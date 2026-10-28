-- Settings → Work and calculations.
ALTER TABLE "Config" ADD COLUMN "holidayRate" REAL NOT NULL DEFAULT 1.5;
ALTER TABLE "Config" ADD COLUMN "roundMinutes" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Config" ADD COLUMN "defaultEmployerId" INTEGER;
ALTER TABLE "Config" ADD COLUMN "itemValue" REAL;
ALTER TABLE "Config" ADD COLUMN "earningsGoal" REAL;
ALTER TABLE "Config" ADD COLUMN "goalPeriod" TEXT NOT NULL DEFAULT 'week';

-- The holiday multiplier each shift was saved with. Existing shifts stay
-- null, which keeps the 1.5 they were always calculated with.
ALTER TABLE "Hourly" ADD COLUMN "holidayRate" REAL;
ALTER TABLE "Production" ADD COLUMN "holidayRate" REAL;
