/* eslint-disable no-console */
import { User } from "@prisma/client";
import prisma from "./client";

async function main() {
  clearDatabase();
  // Crear un usuario
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
  //Crear algunos turnos para el usuario
  const shifts = await prisma.shift.createMany({
    data: [
      {
        start: "2023-04-25T08:00:00.000Z",
        end: "2023-04-25T17:00:00.000Z",
        startDate: "2023-04-25",
        endDate: "2023-04-25",
        amount: 12.5,
        isHoliday: false,
        isClosed: true,
        notes: "Nota por defecto",
        userId: user.id,
      },
      {
        start: "2023-04-26T08:00:00.000Z",
        end: "2023-04-26T17:00:00.000Z",
        startDate: "2023-04-26",
        endDate: "2023-04-26",
        amount: 0,
        isHoliday: false,
        isClosed: false,
        notes: "",
        userId: user.id,
      },
    ],
  });

  console.log(`Se creó el usuario con email: ${user.email}`);
  console.log(`Creados unos ${shifts.count} Shifts`);

  const findFirst = prisma.user.findFirst();
  console.log("El primer usuario encontrado es: ", findFirst);
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
