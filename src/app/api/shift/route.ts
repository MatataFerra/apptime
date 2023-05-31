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
        error: ErrorFactory.createError("QueryNotProvided").exception,
        response: false,
      },
      { status: 400 }
    );
  }

  try {
    const shift = await prisma.shift.findMany({
      where: {
        userId: Number(userId),
      },
    });

    if (shift.length === 0) {
      return NextResponse.json(
        {
          error: ErrorFactory.createError("ShiftNotFound").exception,
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
        error: ErrorFactory.createError("InternalServer").exception,
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

  const amount = ShiftService.differenceBetweenStartAndEnd(parsedBody.data);
  const status = ShiftService.shiftStatus(parsedBody.data);

  try {
    const shift = await prisma.shift.create({
      data: {
        User: {
          connect: {
            id: Number(parsedBody.data?.userId),
          },
        },

        startDate: parsedBody.data.startDate,
        endDate: parsedBody.data.endDate,
        amount,
        isClosed: status,
        isHoliday: parsedBody.data.isHoliday,
        notes: parsedBody.data.notes,
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
          error: ErrorFactory.createError("PrismaClientFields").exception,
          response: false,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: ErrorFactory.createError("InternalServer").exception,
        response: false,
      },
      { status: 500 }
    );
  }
}
