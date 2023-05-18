/*
  Warnings:

  - You are about to drop the column `end` on the `Shift` table. All the data in the column will be lost.
  - You are about to drop the column `start` on the `Shift` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Shift" DROP COLUMN "end",
DROP COLUMN "start";
