import prisma from "#/prisma/client";
import { ErrorFactory } from "@/services";
import { RouteParams, SearchParamsSchema, UserUpdateSchema } from "@/types";
import { QUERY_PARAMS } from "@/utils/constants";
import { User } from "@prisma/client";
import { PrismaClientValidationError } from "@prisma/client/runtime/library";
import { NextResponse, NextRequest } from "next/server";

export async function GET(req: NextRequest, { params }: RouteParams) {
  const searchParams = await req.nextUrl.searchParams;
  const shifts = searchParams.get(QUERY_PARAMS.SHIFTS);
  const profile = searchParams.get(QUERY_PARAMS.PROFILE);

  const parsedSearchParams = SearchParamsSchema.safeParse({
    shifts,
    profile,
  });

  if (!parsedSearchParams.success) {
    return NextResponse.json(
      {
        message: parsedSearchParams.error.issues.map((issue) => ({
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
        shifts: !!parsedSearchParams.data.shifts,
        profile: !!parsedSearchParams.data.profile,
      },
      where: {
        id: params.id,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          error: ErrorFactory.createError("UserNotFound").exception,
          response: false,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        message: "success",
        response: true,
        user,
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

export async function PUT(req: NextRequest, { params }: RouteParams) {
  const body: User = await req.json();
  const parsedBody = UserUpdateSchema.safeParse(body);

  if (!parsedBody.success) {
    return NextResponse.json(
      {
        message: parsedBody.error.issues.map((issue) => ({
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
      where: {
        id: params.id,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          error: ErrorFactory.createError("UserNotFound").exception,
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
    if (error instanceof PrismaClientValidationError) {
      return NextResponse.json(
        {
          error: ErrorFactory.createError("PrismaClientFields").exception,
          response: false,
        },
        { status: 404 }
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
