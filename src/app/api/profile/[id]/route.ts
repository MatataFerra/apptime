import { Profile } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { NextRequest, NextResponse } from "next/server";

import ErrorFactory from "@/services/Error/factory";

import { ProfileUpdateSchema, RouteParams } from "@/types";

import prisma from "#/prisma/client";

export async function PUT(req: NextRequest, { params }: RouteParams) {
  const body: Profile = await req.json();
  const parsedBody = ProfileUpdateSchema.safeParse(body);

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
    const updatedProfile = await prisma.profile.update({
      where: {
        id: Number(params.id),
      },
      data: {
        ...parsedBody.data,
      },
    });

    return NextResponse.json(
      {
        message: "success",
        response: true,
        profile: updatedProfile,
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
