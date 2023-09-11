import { Shift } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { NextRequest, NextResponse } from "next/server";

import ErrorFactory from "@/services/Error/factory";

import { RouteParams, ShiftUpdateSchema } from "@/types";

import prisma from "#/prisma/client";

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
        shift: updatedShift,
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      return NextResponse.json(
        {
          ...ErrorFactory.createError("PrismaClientUpdateRecord"),
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
