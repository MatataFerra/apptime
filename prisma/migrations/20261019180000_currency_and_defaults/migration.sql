-- AlterTable
ALTER TABLE "Hourly" ADD COLUMN "currency" TEXT;

-- AlterTable
ALTER TABLE "Production" ADD COLUMN "currency" TEXT;

-- AlterTable
ALTER TABLE "Config" ADD COLUMN "currency" TEXT NOT NULL DEFAULT 'USD';
ALTER TABLE "Config" ADD COLUMN "hourValue" REAL;
ALTER TABLE "Config" ADD COLUMN "unpaidBreaks" REAL;
ALTER TABLE "Config" ADD COLUMN "holidayPay" REAL NOT NULL DEFAULT 8;
ALTER TABLE "Config" ADD COLUMN "theme" TEXT NOT NULL DEFAULT 'system';
