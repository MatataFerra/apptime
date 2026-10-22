import { Prisma, type User } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

import ErrorFactory from "@/services/Error/factory";

import { type RouteParams, UserUpdateSchema } from "@/types";

import { getRequestSession } from "@/utils/auth/session";

import prisma from "#/prisma/client";

/**
 * What users may change about themselves. Role, account type, status and
 * emailVerified are not self-service: a self-verified email would let a
 * Google sign-in with that address link into this account.
 */
function selfServiceFields({ name, image, online, formCompleted }: Partial<User>) {
  return { name, image, online, formCompleted };
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const session = await getRequestSession(req);
  const isAdmin = session?.user.role === "ADMIN";

  // You can only update yourself (it used to accept any id, signed in or not).
  if (!session || (session.user.id !== id && !isAdmin)) {
    return NextResponse.json({ error: "Unauthorized", response: false }, { status: 401 });
  }

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
        id: id,
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
      data: isAdmin ? parsedBody.data : selfServiceFields(parsedBody.data),
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
