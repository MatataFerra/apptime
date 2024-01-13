/* eslint-disable no-console */

import { Shift, User } from "@prisma/client";
import { hashSync } from "bcryptjs";
import { addDays, addMinutes, differenceInMinutes, isToday as isTheDateToday } from "date-fns";

import prisma from "./client";

const now = new Date(Date.now());
const today = new Date();
const myToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 12, 0, 0);

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

const newDatesMock = [
  myToday, // today at 12:00
  addDays(myToday, -1), // yesterday
  addDays(myToday, -2), // one day before yesterday
  addDays(myToday, -3), // two days before yesterday
  addDays(myToday, -4), // three days before yesterday
];

function addShiftsForSeed(user: User, dates: Array<Date>): Omit<Shift, "id">[] {
  const datesMocked = dates.map((date, i) => {
    return {
      userId: user?.id,
      startDate: date.toString(),
      endDate: isTheDateToday(date) ? null : addMinutes(date, 125 + i).toString(),
      amount: isTheDateToday(date) ? 0 : differenceInMinutes(addMinutes(date, 125 + i), date),
      isClosed: isTheDateToday(date) ? false : true,
      isPublicHoliday: false,
      publicHolidayWorked: false,
      notes: `mocked shift number ${i} from user ${user?.name}`,
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
      password: hashSync(`Secreto${i}!`, 10),
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
    data: [...addShiftsForSeed(firstUser, newDatesMock)],
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

  // update first user and second user who have form completed
  await prisma.user.update({
    where: {
      id: firstUser.id,
    },
    data: {
      formCompleted: true,
    },
  });

  await prisma.user.update({
    where: {
      id: secondUser.id,
    },
    data: {
      formCompleted: true,
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
