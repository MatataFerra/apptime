import prisma from "#/prisma/client";
import { ErrorFactory, AuthService } from "@/services";
import { SearchParamsSchema, UserCreateSchema } from "@/types";
import { QUERY_PARAMS } from "@/utils/constants";
import { User } from "@prisma/client";
import { hash } from "bcryptjs";
import { NextResponse, NextRequest } from "next/server";

export async function GET(req: NextRequest) {
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
    const user = await prisma.user.findMany({
      include: {
        shifts: !!parsedSearchParams.data.shifts,
        profile: !!parsedSearchParams.data.profile,
      },
    });

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
        ...ErrorFactory.createError("InternalServer", { error }),
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
          error: ErrorFactory.createError("UserAlreadyExists"),
          response: false,
        },
        { status: 400 }
      );
    }

    const hashPassword = await hash(parsedBody.data.password, 10);

    const newUser = await prisma.user.create({
      data: {
        email: parsedBody.data.email,
        name: parsedBody.data.name,
        password: hashPassword,
        formCompleted: parsedBody.data.formCompleted,
        online: parsedBody.data.online,
        image: parsedBody.data.image,
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
    return NextResponse.json(
      {
        error: ErrorFactory.createError("InternalServer"),
        response: false,
      },
      { status: 500 }
    );
  }
}
