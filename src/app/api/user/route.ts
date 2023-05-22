import prisma from "#/prisma/client";
import { SearchParamsSchema, UserCreateSchema } from "@/types";
import { User } from "@prisma/client";
import { NextResponse, NextRequest } from "next/server";

export async function GET(req: NextRequest) {
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
    const user = await prisma.user.findMany({
      include: {
        shifts: !!parsedSearchParams.data.shifts,
        profile: !!parsedSearchParams.data.profile,
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

export async function POST(req: NextRequest) {
  const body: User = await req.json();

  const parsedBody = UserCreateSchema.safeParse(body);

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
        email: parsedBody.data.email,
      },
    });

    if (user) {
      return NextResponse.json(
        {
          message: "User already exists",
          response: false,
        },
        { status: 400 }
      );
    }

    const newUser = await prisma.user.create({
      data: {
        email: parsedBody.data.email,
        name: parsedBody.data.name,
        lastname: parsedBody.data.lastname,
        password: parsedBody.data.password,
        formCompleted: parsedBody.data.formCompleted,
        online: parsedBody.data.online,
      },
    });

    return NextResponse.json(
      {
        message: "success",
        response: true,
        user: newUser,
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
