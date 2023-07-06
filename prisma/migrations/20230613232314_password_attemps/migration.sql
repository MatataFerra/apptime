-- CreateTable
CREATE TABLE "PasswordAttemps" (
    "id" SERIAL NOT NULL,
    "maxAttemps" INTEGER NOT NULL DEFAULT 5,
    "renewAttemps" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT,

    CONSTRAINT "PasswordAttemps_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PasswordAttemps_userId_key" ON "PasswordAttemps"("userId");

-- AddForeignKey
ALTER TABLE "PasswordAttemps" ADD CONSTRAINT "PasswordAttemps_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
