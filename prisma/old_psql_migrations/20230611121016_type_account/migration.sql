-- CreateEnum
CREATE TYPE "Type" AS ENUM ('OAUTH', 'CREDENTIALS');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "type_account" "Type" NOT NULL DEFAULT 'CREDENTIALS';
