/* eslint-disable no-console */

import { Shift, User } from "@prisma/client";
import { hashSync } from "bcryptjs";
import { addDays, addMinutes, differenceInMinutes } from "date-fns";

import prisma from "./client";
const now = new Date();
const datesMock = [
  now, // today
  addDays(now, -1), // yesterday
  addDays(now, -2), // one day before yesterday
  addDays(now, 1), // tomorrow
  addDays(now, 2), // one day after tomorrow
  addDays(now, 8), // one day after one week after
  addDays(now, 7), // one week after
  addDays(now, -7), // one week before
  addDays(now, -8), // one day before one week before
];

function addShiftsForSeed(user: User): Shift[] {
  const datesMocked = datesMock.map((date, i) => {
    return {
      id: i,
      userId: user?.id,
      startDate: date.toString(),
      endDate: addMinutes(date, 125 + i).toString(),
      amount: differenceInMinutes(addMinutes(date, 125 + i), date),
      isClosed: true,
      isPublicHoliday: false,
      publicHolidayWorked: false,
      notes: "mocked shift",
    };
  });

  return datesMocked;
}

function addUsersMocked(): Omit<User, "id">[] {
  return Array.from({ length: 5 }, (_, i) => {
    return {
      email: `usuario${i}@example.com`.trim(),
      name: `User Testing ${i}`,
      emailVerified: null,
      formCompleted: false,
      image: "https://placehold.co/100x100",
      online: false,
      password: hashSync(`secreto${i}`, 10),
      type_account: "CREDENTIALS",
      role: i === 4 ? "ADMIN" : "USER",
      isActive: true,
    };
  });
}

async function main() {
  await clearDatabase();

  await prisma.user.createMany({
    data: [...addUsersMocked()],
  });

  const firstUser = await prisma.user.findUnique({
    where: {
      email: [...addUsersMocked()][1].email,
    },
  });

  const secondUser = await prisma.user.findUnique({
    where: {
      email: [...addUsersMocked()][2].email,
    },
  });

  if (!firstUser || !secondUser) {
    console.log("Error: Users not found");
    return;
  }

  await prisma.shift.createMany({
    skipDuplicates: true,
    data: [...addShiftsForSeed(firstUser)],
  });

  await prisma.profile.create({
    data: {
      User: {
        connect: {
          id: firstUser.id,
        },
      },
      endHour: 17,
      extraNightShiftPay: 0,
      holidayPay: true,
      holidayPayRate: 1.5,
      hourlyRate: 10.5,
      nightShift: false,
      startHour: 8,
      unpaidBreaks: 0,
    },
  });

  await prisma.profile.create({
    data: {
      User: {
        connect: {
          id: secondUser.id,
        },
      },
      endHour: 19,
      extraNightShiftPay: 0,
      holidayPay: true,
      holidayPayRate: 2,
      hourlyRate: 22,
      nightShift: true,
      startHour: 10,
      unpaidBreaks: 30,
    },
  });

  const emails = (await prisma.user.findMany({})).map((user) => user.email);
  console.log("users with these emails have been created ", emails);
}

async function clearDatabase() {
  const transaction = await prisma.$transaction([
    prisma.shift.deleteMany(),
    prisma.user.deleteMany(),
    prisma.profile.deleteMany(),
  ]);

  return transaction;
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
