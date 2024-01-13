/*
  Warnings:

  - You are about to drop the column `holidayWorked` on the `Shift` table. All the data in the column will be lost.
  - You are about to drop the column `isHoliday` on the `Shift` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Shift" DROP COLUMN "holidayWorked",
DROP COLUMN "isHoliday",
ADD COLUMN     "isPublicHoliday" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "publicHolidayWorked" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;
