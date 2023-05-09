import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
const prisma = new PrismaClient({ log: ["info"] });

const ShiftModelSchema = z.object({
  id: z.number({
    required_error: "Id must be provided correctly",
  }),
  amount: z.number(),
  end: z.string(),
  endDate: z.string(),
  isClosed: z.boolean(),
  isHoliday: z.boolean(),
  notes: z.string(),
  start: z.string(),
  startDate: z.string(),
  userId: z.number().optional(),
});

const UserModelSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  endHour: z.number(),
  extraNightShiftPay: z.number(),
  formCompleted: z.boolean(),
  holidayPay: z.boolean(),
  holidayPayRate: z.number(),
  hourlyRate: z.number(),
  lastname: z.string(),
  name: z.string(),
  nightShift: z.boolean(),
  online: z.boolean(),
  password: z.string(),
  startHour: z.number(),
  unpaidBreaks: z.number(),
  shifts: z.array(ShiftModelSchema),
});

const Data = z.object({
  message: z.string(),
  response: z.boolean(),
  shift: z.array(ShiftModelSchema).optional(),
  user: z.array(UserModelSchema).optional(),
});

export type TypeData = z.infer<typeof Data>;

export async function GET(req: NextRequest) {
  const user = await prisma.user.findMany({
    include: {
      shifts: true,
    },
  });

  const shift = await prisma.shift.findMany();

  const parsedData = Data.parse({
    message: "request from app/api/",
    response: true,
    user,
    shift,
  });

  return NextResponse.json(parsedData);
}
