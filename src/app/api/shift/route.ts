import { Prisma, Shift } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

import ErrorFactory from "@/services/Error/factory";
import ShiftService from "@/services/Shift";

import { ShiftCreateSchema } from "@/types";

import { QUERY_PARAMS } from "@/utils/constants";

import prisma from "#/prisma/client";

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get(QUERY_PARAMS.USER_ID);

  if (!userId) {
    return NextResponse.json(
      {
        ...ErrorFactory.createError("QueryNotProvided"),
        response: false,
      },
      { status: 400 }
    );
  }

  try {
    const shift = await prisma.shift.findMany({
      where: {
        userId: userId,
      },
    });

    if (shift.length === 0) {
      return NextResponse.json(
        {
          ...ErrorFactory.createError("ShiftNotFound"),
          response: false,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        message: "success",
        response: true,
        shift,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        ...ErrorFactory.createError("InternalServer"),
        response: false,
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const body: Shift = await req.json();
  const parsedBody = ShiftCreateSchema.safeParse(body);

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

  if (!parsedBody.data.userId) {
    return NextResponse.json(
      {
        error: ErrorFactory.createError("BodyNotProvided"),
        response: false,
      },
      { status: 400 }
    );
  }
  const shiftTransform = new ShiftService(parsedBody.data).checkPublicHoliday().build();

  try {
    const shift = await new ShiftService(shiftTransform).create({
      userId: parsedBody.data.userId,
    });

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
          error: ErrorFactory.createError("PrismaClientFields"),
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
