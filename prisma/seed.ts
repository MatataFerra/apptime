/* eslint-disable no-console */

import { User } from "@prisma/client";
import { hashSync } from "bcryptjs";
import { addDays, addMinutes, differenceInMinutes, isToday as isTheDateToday } from "date-fns";

import prisma from "./client";

const today = new Date();
const myToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 12, 0, 0);

const newDatesMock = [
  myToday, // today at 12:00
  addDays(myToday, -1), // yesterday
  addDays(myToday, -2), // one day before yesterday
  addDays(myToday, -3), // two days before yesterday
  addDays(myToday, -4), // three days before yesterday
];

function addProductionShiftsForSeed(dates: Array<Date>) {
  return dates.map((date, i) => ({
    startDate: date.toString(),
    endDate: isTheDateToday(date) ? null : addMinutes(date, 125 + i).toString(),
    amount: isTheDateToday(date) ? 0 : differenceInMinutes(addMinutes(date, 125 + i), date),
    isClosed: isTheDateToday(date) ? false : true,
    itemValue: i === 2 ? 0.023 : null,
    itemQuantity: i === 2 ? 520 : null,
    holidayPay: true,
    holidayPayRate: 0,
    isPublicHoliday: false,
    notes: `This is a note for the shift ${i + 1}`,
    publicHolidayWorked: false,
  }));
}

function addHourlyShiftsForSeed(dates: Array<Date>) {
  return dates.map((date, i) => ({
    startDate: date.toString(),
    endDate: isTheDateToday(date) ? null : addMinutes(date, 125 + i).toString(),
    amount: isTheDateToday(date) ? 0 : differenceInMinutes(addMinutes(date, 125 + i), date),
    isClosed: isTheDateToday(date) ? false : true,
    hourValue: 27,
    holidayPay: true,
    holidayPayRate: 0,
    isPublicHoliday: false,
    notes: "",
    publicHolidayWorked: false,
    unpaidBreaks: 0,
  }));
}

function addUsersMocked(): Omit<User, "id">[] {
  return Array.from({ length: 5 }, (_, i) => {
    return {
      email: `usuario${i}@example.com`.trim(),
      name: `User Testing ${i}`,
      emailVerified: null,
      formCompleted: false,
      image: "/assets/avatar.svg",
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

  for (const userData of addUsersMocked()) {
    const user = await prisma.user.create({
      data: {
        email: userData.email,
        name: userData.name,
        emailVerified: userData.emailVerified,
        formCompleted: userData.formCompleted,
        image: userData.image,
        online: userData.online,
        password: userData.password,
        type_account: userData.type_account,
        role: userData.role,
        isActive: userData.isActive,
      },
    });

    await prisma.shift.create({
      data: {
        user: {
          connect: {
            id: user.id,
          },
        },
      },
    });
  }

  const firstUser = await prisma.user.findUnique({
    where: {
      email: [...addUsersMocked()][1].email,
    },
    include: {
      shifts: true,
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

  for (const prodShift of addProductionShiftsForSeed(newDatesMock)) {
    await prisma.production.create({
      data: {
        shift: {
          connect: {
            id: firstUser.shifts?.id,
          },
        },
        ...prodShift,
      },
    });
  }

  for (const hourlyShift of addHourlyShiftsForSeed(newDatesMock)) {
    await prisma.hourly.create({
      data: {
        shift: {
          connect: {
            id: firstUser.shifts?.id,
          },
        },
        ...hourlyShift,
      },
    });
  }

  await prisma.profile.create({
    data: {
      user: {
        connect: {
          id: firstUser.id,
        },
      },
      firstName: "Testing",
      lastName: "Surname",
      address: "House mock",
      city: "City mock",
      country: "Argentina",
    },
  });

  await prisma.profile.create({
    data: {
      user: {
        connect: {
          id: secondUser.id,
        },
      },
      firstName: "User",
      lastName: "Lastname",
      address: "Adress mock",
      city: "City mock",
      country: "Argentina",
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
    prisma.production.deleteMany(),
    prisma.hourly.deleteMany(),
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
