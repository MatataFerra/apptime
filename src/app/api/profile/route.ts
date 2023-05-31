import { NextRequest, NextResponse } from "next/server";
import { ErrorFactory } from "@/services";
import prisma from "#/prisma/client";
import { Profile } from "@prisma/client";
import { ProfileCreateSchema } from "@/types";
import { PrismaClientValidationError } from "@prisma/client/runtime/library";

export async function GET(req: NextRequest) {
  const searchParams = await req.nextUrl.searchParams;
  const userId = searchParams.get("userId");

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
    const profile = await prisma.profile.findUnique({
      where: {
        userId: Number(userId),
      },
    });

    if (!profile) {
      return NextResponse.json(
        {
          error: ErrorFactory.createError("ProfileNotFound").exception,
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
        error: ErrorFactory.createError("InternalServer").exception,
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
    const user = await prisma.user.findUnique({
      include: {
        profile: true,
      },
      where: {
        id: Number(parsedBody.data?.userId),
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          error: ErrorFactory.createError("UserNotFound").exception,
          response: false,
        },
        { status: 404 }
      );
    }

    if (user.profile) {
      return NextResponse.json(
        {
          error: ErrorFactory.createError("ProfileAlreadyExists").exception,
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
