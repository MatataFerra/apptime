import prisma from "#/prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { Shift } from "@prisma/client";
import { ShiftCreateSchema } from "@/types";
import { ShiftService, ErrorFactory } from "@/services";
import { PrismaClientValidationError } from "@prisma/client/runtime/library";
import { QUERY_PARAMS } from "@/utils/constants";

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
        error: parsedBody.error.issues.map((issue) => ({
          error: issue.message,
          input: issue.path,
        })),
        response: false,
      },
      { status: 400 }
    );
  }

  if (!parsedBody.data.userId) {
    return NextResponse.json(
      {
        ...ErrorFactory.createError("BodyNotProvided"),
        response: false,
      },
      { status: 400 }
    );
  }
  const shiftTransform = new ShiftService(parsedBody.data)
    .differenceInMinsBetweenStartAndEnd()
    .updateStatus()
    .build();

  try {
    const shift = await prisma.shift.create({
      data: {
        User: {
          connect: {
            id: parsedBody?.data?.userId,
          },
        },

        startDate: shiftTransform.startDate,
        endDate: shiftTransform.endDate,
        amount: shiftTransform.amount,
        isClosed: shiftTransform.isClosed,
        isHoliday: shiftTransform.isHoliday,
        notes: shiftTransform.notes,
      },
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
    if (error instanceof PrismaClientValidationError) {
      return NextResponse.json(
        {
          ...ErrorFactory.createError("PrismaClientFields"),
          response: false,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        ...ErrorFactory.createError("InternalServer"),
        response: false,
      },
      { status: 500 }
    );
  }
}
