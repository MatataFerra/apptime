import { Hourly, Prisma, Production } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

import ErrorFactory from "@/services/Error/factory";
import ShiftService from "@/services/Shift";

import { BaseShiftSchema, RouteParams, TypeShift } from "@/types";

import { isProductionShift } from "@/utils/helpers/isProductionShift";

import prisma from "#/prisma/client";

import { revalidateShiftPages } from "@/utils/helpers/revalidateShiftPages";

export async function PUT(req: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const body: Production | Hourly = await req.json();
  const parsedBody = BaseShiftSchema.safeParse(body);

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
    const buildShift = new ShiftService(body)
      .closeShift()
      .checkPublicHoliday()
      .differenceInMinsBetweenStartAndEnd()
      .build();

    const updatedShift = isProductionShift(buildShift as Production | Hourly)
      ? await prisma.production.update({
          where: {
            id: Number(id),
          },
          data: buildShift,
        })
      : await prisma.hourly.update({
          where: {
            id: Number(id),
          },
          data: buildShift,
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

    revalidateShiftPages();

    return NextResponse.json(
      {
        message: "success",
        response: true,
        shift: updatedShift,
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
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
  const { id } = await params;
  try {
    const deletedShift = await prisma.shift.delete({
      where: {
        id: Number(id),
      },
    });

    if (!deletedShift) {
      return NextResponse.json(
        {
          error: ErrorFactory.createError("ShiftNotFound"),
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
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json(
        {
          error: ErrorFactory.createError("CustomError", {
            error: error.meta,
          }),
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
