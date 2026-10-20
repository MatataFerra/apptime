import { type Hourly, Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

import ErrorFactory from "@/services/Error/factory";
import ShiftService from "@/services/Shift";

import { HourlyCreateSchema } from "@/types";

import { getRequestSession } from "@/utils/auth/session";

import prisma from "#/prisma/client";

export async function POST(req: NextRequest) {
  const body: Hourly = await req.json();
  const parsedBody = HourlyCreateSchema.safeParse(body);

  if (!parsedBody.success) {
    return NextResponse.json(
      {
        error: ErrorFactory.createError("DataProvidedIsNotValid", {
          error: parsedBody.error,
        }),
        response: false,
      },
      { status: 400 }
    );
  }

  if (!parsedBody.data.shiftId) {
    return NextResponse.json(
      {
        error: ErrorFactory.createError("BodyNotProvided"),
        response: false,
      },
      { status: 400 }
    );
  }
  const shiftTransform = new ShiftService(body).checkPublicHoliday().build<Hourly>();

  try {
    const shift = await new ShiftService(shiftTransform).create();

    return NextResponse.json(
      {
        message: "success",
        response: true,
        shift,
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof Prisma.PrismaClientValidationError) {
      return NextResponse.json(
        {
          error: ErrorFactory.createError("PrismaClientFields", { message: error.message }),
          response: false,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: ErrorFactory.createError("InternalServer"),
        response: false,
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const checkToken = (await getRequestSession(req))?.user ?? null;

  if (!checkToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!checkToken.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // One query, no transaction: it's a read, and an interactive transaction
  // over Turso could hit Prisma's 5 s timeout.
  const hourly = await prisma.hourly.findMany({
    where: { shift: { user: { email: checkToken.email } } },
    include: { taxes: true },
  });

  if (!hourly) {
    return NextResponse.json({ message: "Something went wrong", hourly }, { status: 400 });
  }

  return NextResponse.json(
    {
      message: "success",
      response: true,
      hourly,
    },
    { status: 200 }
  );
}
