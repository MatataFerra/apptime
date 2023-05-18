/* eslint-disable no-console */
import { User } from "@prisma/client";
import prisma from "./client";

async function main() {
  clearDatabase();

  const user: User = await prisma.user.create({
    data: {
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
  });

  const shifts = await prisma.shift.createMany({
    data: [
      {
        startDate: "2023-04-25T08:00:00.000Z",
        endDate: "2023-04-25T17:00:00.000Z",
        amount: 12.5,
        isHoliday: false,
        isClosed: true,
        notes: "Nota por defecto",
        userId: user.id,
      },
      {
        startDate: "2023-04-25T08:00:00.000Z",
        endDate: "2023-04-25T17:00:00.000Z",
        amount: 0,
        isHoliday: false,
        isClosed: false,
        notes: "",
        userId: user.id,
      },
    ],
  });

  const findFirst = await prisma.user.findFirst({
    include: {
      shifts: true,
    },
    where: {
      id: user.id,
    },
  });
  console.log("Se creó el usuario con email: ", findFirst?.email);
  console.log("Se crearon un total de ", findFirst?.shifts.length, " shifts");
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
