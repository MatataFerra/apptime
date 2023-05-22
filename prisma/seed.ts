/* eslint-disable no-console */
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
        online: false,
        formCompleted: false,
      },

      {
        email: "test@example.com",
        name: "Testing Name",
        lastname: "Testing lastname",
        password: "ultra-secreto",
        online: false,
        formCompleted: false,
      },
    ],
  });

  const firstUser = await prisma.user.findUnique({
    where: {
      email: "usuario1@example.com",
    },
  });

  const secondUser = await prisma.user.findUnique({
    where: {
      email: "test@example.com",
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
        notes: `Default note from ${firstUser?.name}`,
        userId: firstUser?.id,
      },
      {
        startDate: "2023-04-25T08:00:00.000Z",
        endDate: "2023-04-25T17:00:00.000Z",
        amount: 0,
        isHoliday: false,
        isClosed: false,
        notes: "",
        userId: firstUser?.id,
      },
    ],
  });

  await prisma.shift.create({
    data: {
      startDate: "2023-04-25T08:00:00.000Z",
      endDate: "2023-04-25T17:00:00.000Z",
      amount: 12.5,
      isHoliday: false,
      isClosed: true,
      notes: `Default note from ${secondUser?.name}`,
      userId: secondUser?.id,
    },
  });

  await prisma.profile.create({
    data: {
      userId: firstUser?.id,
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
