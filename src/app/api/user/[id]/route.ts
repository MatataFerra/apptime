/* eslint-disable no-console */
import prisma from "#/prisma/client";
import { Data, UserUpdateSchema } from "@/types";
import { Prisma, User } from "@prisma/client";
import { NextResponse, NextRequest } from "next/server";

type UserParams = {
  params: {
    id: string;
  };
};

export async function GET(req: NextRequest, { params }: UserParams) {
  try {
    const user = await prisma.user.findUnique({
      include: {
        shifts: true,
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

    const parsedData = Data.safeParse({
      message: "success",
      response: true,
      user,
    });

    if (!parsedData.success) {
      return NextResponse.json(
        {
          message: parsedData.error.issues.map((issue) => ({
            error: issue.message,
            input: issue.path,
          })),
          response: false,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        message: parsedData.data.message,
        response: parsedData.data.response,
        user: parsedData.data.user,
      },
      { status: 200 }
    );
  } catch (error) {
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

      include: {
        shifts: true,
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
