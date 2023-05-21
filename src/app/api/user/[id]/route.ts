import prisma from "#/prisma/client";
import { SearchParamsSchema, UserUpdateSchema } from "@/types";
import { Prisma, User } from "@prisma/client";
import { NextResponse, NextRequest } from "next/server";

type UserParams = {
  params: {
    id: string;
  };
};

export async function GET(req: NextRequest, { params }: UserParams) {
  const searchParams = await req.nextUrl.searchParams;
  const shifts = searchParams.get("shifts");
  const profile = searchParams.get("profile");

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
        id: Number(params.id),
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          message: "User not found",
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
    // eslint-disable-next-line no-console
    console.error(error);

    return NextResponse.json(
      {
        message: "Internal Server Error",
        response: false,
      },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest, { params }: UserParams) {
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
        id: Number(params.id),
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          message: "User not found",
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
        ...body,
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
          message: "Please provide valid fields",
          response: false,
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message: "Internal Server Error",
        response: false,
      },
      { status: 500 }
    );
  }
}
