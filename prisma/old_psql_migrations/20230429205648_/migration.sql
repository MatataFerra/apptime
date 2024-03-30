-- CreateTable
CREATE TABLE "Shift" (
    "id" SERIAL NOT NULL,
    "start" TEXT NOT NULL,
    "end" TEXT,
    "startDate" TEXT NOT NULL,
    "endDate" TEXT,
    "amount" DOUBLE PRECISION,
    "isHoliday" BOOLEAN NOT NULL DEFAULT false,
    "isClosed" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "userId" INTEGER,

    CONSTRAINT "Shift_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "lastname" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "hourlyRate" DOUBLE PRECISION NOT NULL,
    "startHour" DOUBLE PRECISION NOT NULL,
    "endHour" DOUBLE PRECISION NOT NULL,
    "nightShift" BOOLEAN NOT NULL,
    "extraNightShiftPay" DOUBLE PRECISION,
    "holidayPay" BOOLEAN NOT NULL,
    "holidayPayRate" DOUBLE PRECISION,
    "unpaidBreaks" DOUBLE PRECISION,
    "online" BOOLEAN NOT NULL DEFAULT false,
    "formCompleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "Shift" ADD CONSTRAINT "Shift_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
