import { Prisma, type User } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import type { JWT } from "next-auth/jwt";

import ErrorFactory from "@/services/Error/factory";

import { type RouteParams, UserUpdateSchema } from "@/types";

import prisma from "#/prisma/client";

function parseEmailFromParams(token: JWT | null, email: string | null) {
  if (token?.role !== "ADMIN") return token?.email;
  return email;
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  const body: User = await req.json();
  const parsedBody = UserUpdateSchema.safeParse(body);

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
    const user = await prisma.user.findUnique({
      where: {
        id: params.id,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          error: ErrorFactory.createError("UserNotFound"),
          response: false,
        },
        { status: 400 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        ...parsedBody.data,
      },
    });

    return NextResponse.json(
      {
        message: "success",
        response: true,
        user: updatedUser,
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
        { status: 404 }
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
