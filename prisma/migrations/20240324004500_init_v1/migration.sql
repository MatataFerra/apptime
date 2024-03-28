-- CreateTable
CREATE TABLE "Shift" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "startDate" TEXT NOT NULL,
    "endDate" TEXT,
    "amount" REAL,
    "isPublicHoliday" BOOLEAN NOT NULL DEFAULT false,
    "publicHolidayWorked" BOOLEAN NOT NULL DEFAULT false,
    "isClosed" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "userId" TEXT,
    CONSTRAINT "Shift_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "emailVerified" DATETIME,
    "image" TEXT,
    "name" TEXT NOT NULL,
    "password" TEXT,
    "type_account" TEXT NOT NULL DEFAULT 'CREDENTIALS',
    "role" TEXT NOT NULL DEFAULT 'USER',
    "online" BOOLEAN NOT NULL DEFAULT false,
    "formCompleted" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true
);

-- CreateTable
CREATE TABLE "Profile" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "hourlyRate" REAL NOT NULL,
    "startHour" REAL NOT NULL,
    "endHour" REAL NOT NULL,
    "nightShift" BOOLEAN NOT NULL,
    "extraNightShiftPay" REAL,
    "holidayPay" BOOLEAN NOT NULL,
    "holidayPayRate" REAL,
    "unpaidBreaks" REAL,
    "userId" TEXT,
    CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PasswordAttemps" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "maxAttemps" INTEGER NOT NULL DEFAULT 5,
    "renewAttemps" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT,
    CONSTRAINT "PasswordAttemps_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WaitingListDesktop" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_userId_key" ON "Profile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "PasswordAttemps_userId_key" ON "PasswordAttemps"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "WaitingListDesktop_email_key" ON "WaitingListDesktop"("email");
