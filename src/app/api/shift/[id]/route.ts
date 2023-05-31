import prisma from "#/prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { ErrorFactory } from "@/services";
import { Shift } from "@prisma/client";
import { RouteParams, ShiftUpdateSchema } from "@/types";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

export async function PUT(req: NextRequest, { params }: RouteParams) {
  const body: Shift = await req.json();
  const parsedBody = ShiftUpdateSchema.safeParse(body);

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

  try {
    const updatedShift = await prisma.shift.update({
      where: {
        id: Number(params.id),
      },
      data: {
        ...parsedBody.data,
      },
    });

    if (!updatedShift) {
      return NextResponse.json(
        {
          error: ErrorFactory.createError("ShiftNotFound").exception,
          response: false,
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message: "success",
        response: true,
        shift: updatedShift,
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      return NextResponse.json(
        {
          error: ErrorFactory.createError("PrismaClientUpdateRecord").exception,
          response: false,
        },
        { status: 408 }
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
