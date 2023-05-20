/* eslint-disable no-console */
import prisma from "#/prisma/client";
import { UserCreateSchema } from "@/types";
import { User } from "@prisma/client";
import { NextResponse, NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const user = await prisma.user.findMany({
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

    return NextResponse.json(
      {
        message: "success",
        response: true,
        user,
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
        endHour: parsedBody.data.endHour,
        holidayPay: parsedBody.data.holidayPay,
        name: parsedBody.data.name,
        startHour: parsedBody.data.startHour,
        hourlyRate: parsedBody.data.hourlyRate,
        lastname: parsedBody.data.lastname,
        nightShift: parsedBody.data.nightShift,
        password: parsedBody.data.password,
        extraNightShiftPay: parsedBody.data.extraNightShiftPay,
        formCompleted: parsedBody.data.formCompleted,
        holidayPayRate: parsedBody.data.holidayPayRate,
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
