import { Prisma, Profile } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

import ErrorFactory from "@/services/Error/factory";
import ProfileService from "@/services/Profile";

import { ProfileCreateSchema } from "@/types";

import { QUERY_PARAMS } from "@/utils/constants";

import prisma from "#/prisma/client";

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get(QUERY_PARAMS.USER_ID);

  if (!userId) {
    return NextResponse.json(
      {
        error: ErrorFactory.createError("QueryNotProvided"),
        response: false,
      },
      { status: 400 }
    );
  }

  try {
    const profile = await prisma.profile.findUnique({
      where: {
        userId,
      },
    });

    if (!profile) {
      return NextResponse.json(
        {
          error: ErrorFactory.createError("ProfileNotFound"),
          response: false,
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message: "success",
        response: true,
        profile,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: ErrorFactory.createError("InternalServer"),
        response: false,
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const body: Profile = await req.json();
  const parsedBody = ProfileCreateSchema.safeParse(body);

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

  try {
    const user = await prisma.user.findUnique({
      include: {
        profile: true,
      },
      where: {
        id: parsedBody.data?.userId,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          error: ErrorFactory.createError("UserNotFound"),
          response: false,
        },
        { status: 404 }
      );
    }

    if (user.profile) {
      return NextResponse.json(
        {
          error: ErrorFactory.createError("ProfileAlreadyExists"),
          response: false,
        },
        { status: 400 }
      );
    }

    const {
      data: { firstName, address, city, country, lastName },
    } = parsedBody;

    const profile = await ProfileService.createProfile({
      userId: user.id,
      profile: {
        firstName,
        lastName,
        address,
        city,
        country,
      },
    });

    return NextResponse.json(
      {
        message: "success",
        response: true,
        profile,
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
