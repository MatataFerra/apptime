import { Profile } from "@prisma/client";
import { PrismaClientValidationError } from "@prisma/client/runtime/library";
import { NextRequest, NextResponse } from "next/server";

import ErrorFactory from "@/services/Error/factory";

import { ProfileCreateSchema } from "@/types";

import { QUERY_PARAMS } from "@/utils/constants";

import prisma from "#/prisma/client";

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
    const profile = await prisma.profile.findUnique({
      where: {
        userId,
      },
    });

    if (!profile) {
      return NextResponse.json(
        {
          ...ErrorFactory.createError("ProfileNotFound"),
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
        ...ErrorFactory.createError("InternalServer"),
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
        ...ErrorFactory.createError("DataProvidedIsNotValid", {
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
        ...ErrorFactory.createError("BodyNotProvided"),
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
          ...ErrorFactory.createError("UserNotFound"),
          response: false,
        },
        { status: 404 }
      );
    }

    if (user.profile) {
      return NextResponse.json(
        {
          ...ErrorFactory.createError("ProfileAlreadyExists"),
          response: false,
        },
        { status: 400 }
      );
    }

    const profile = await prisma.profile.create({
      data: {
        User: {
          connect: {
            id: user.id,
          },
        },

        endHour: parsedBody.data?.endHour,
        startHour: parsedBody.data?.startHour,
        holidayPay: parsedBody.data?.holidayPay,
        hourlyRate: parsedBody.data?.hourlyRate,
        nightShift: parsedBody.data?.nightShift,
        extraNightShiftPay: parsedBody.data?.extraNightShiftPay,
        holidayPayRate: parsedBody.data?.holidayPayRate,
        unpaidBreaks: parsedBody.data?.unpaidBreaks,
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
