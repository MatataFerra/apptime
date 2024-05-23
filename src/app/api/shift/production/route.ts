import { Prisma, Production } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

import ErrorFactory from "@/services/Error/factory";
import ShiftService from "@/services/Shift";

import { ProductionCreateSchema } from "@/types";

export async function POST(req: NextRequest) {
  const body: Production = await req.json();
  const parsedBody = ProductionCreateSchema.safeParse(body);

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
  const shiftTransform = new ShiftService(body).checkPublicHoliday().build<Production>();

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
