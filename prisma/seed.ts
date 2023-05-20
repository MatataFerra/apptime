/* eslint-disable no-console */
import { User } from "@prisma/client";
import prisma from "./client";

async function main() {
  clearDatabase();

  await prisma.user.createMany({
    data: [
      {
        email: "usuario1@example.com",
        name: "Usuario",
        lastname: "Uno",
        password: "secreto",
        hourlyRate: 10.5,
        startHour: 8.0,
        endHour: 17.0,
        nightShift: false,
        extraNightShiftPay: 0.0,
        holidayPay: true,
        holidayPayRate: 1.5,
        unpaidBreaks: 0.0,
        online: false,
        formCompleted: false,
      },

      {
        email: "test@example.com",
        name: "Ramiro",
        lastname: "Test",
        password: "ultra-secreto",
        hourlyRate: 10.5,
        startHour: 8.0,
        endHour: 17.0,
        nightShift: true,
        extraNightShiftPay: 2.0,
        holidayPay: true,
        holidayPayRate: 1.5,
        unpaidBreaks: 30.0,
        online: false,
        formCompleted: false,
      },
    ],
  });

  const oneUser = await prisma.user.findUnique({
    where: {
      email: "usuario1@example.com",
    },
  });

  await prisma.shift.createMany({
    data: [
      {
        startDate: "2023-04-25T08:00:00.000Z",
        endDate: "2023-04-25T17:00:00.000Z",
        amount: 12.5,
        isHoliday: false,
        isClosed: true,
        notes: "Nota por defecto",
        userId: oneUser?.id,
      },
      {
        startDate: "2023-04-25T08:00:00.000Z",
        endDate: "2023-04-25T17:00:00.000Z",
        amount: 0,
        isHoliday: false,
        isClosed: false,
        notes: "",
        userId: oneUser?.id,
      },
    ],
  });

  const emails = await (
    await prisma.user.findMany({})
  ).map((user) => user.email);
  console.log("users with these emails have been created ", emails);
}

async function clearDatabase() {
  const transaction = await prisma.$transaction([
    prisma.shift.deleteMany(),
    prisma.user.deleteMany(),
  ]);

  return transaction;
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
