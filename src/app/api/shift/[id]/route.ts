import { Shift } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

import ErrorFactory from "@/services/Error/factory";
import ShiftService from "@/services/Shift";

import { RouteParams, ShiftUpdateSchema } from "@/types";

import prisma from "#/prisma/client";

export async function PUT(req: NextRequest, { params }: RouteParams) {
  const body: Omit<Shift, "id"> = await req.json();
  const parsedBody = ShiftUpdateSchema.safeParse(body);

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

  try {
    const buildShift = new ShiftService({ ...parsedBody.data })
      .closeShift()
      .checkPublicHoliday()
      .differenceInMinsBetweenStartAndEnd()
      .build();

    const updatedShift = await prisma.shift.update({
      where: {
        id: Number(params.id),
      },
      data: {
        ...buildShift,
      },
    });

    if (!updatedShift) {
      return NextResponse.json(
        {
          error: ErrorFactory.createError("ShiftNotFound"),
          response: false,
        },
        { status: 404 }
      );
    }

    revalidatePath("/", "page");

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
          error: ErrorFactory.createError("PrismaClientUpdateRecord"),
          response: false,
        },
        { status: 408 }
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

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const deletedShift = await prisma.shift.delete({
      where: {
        id: Number(params.id),
      },
    });

    if (!deletedShift) {
      return NextResponse.json(
        {
          ...ErrorFactory.createError("ShiftNotFound"),
          response: false,
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message: "success",
        response: true,
        shift: deletedShift,
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      return NextResponse.json(
        {
          ...ErrorFactory.createError("CustomError", {
            error: error.meta,
          }),
          response: false,
        },
        { status: 408 }
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
