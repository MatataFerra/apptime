import { NextRequest, NextResponse } from "next/server";
import { object, string } from "zod";

import ErrorFactory from "@/services/Error/factory";

import prisma from "#/prisma/client";

export async function GET() {
  const waitingList = await prisma?.waitingListDesktop.findMany();

  return NextResponse.json(
    {
      message: "success",
      response: true,
      waitingList,
    },
    { status: 200 }
  );
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  const WaitingListSchema = object({
    email: string().email(),
  });

  const validate = WaitingListSchema.safeParse(body);

  if (!validate.success) {
    return NextResponse.json(
      {
        ...ErrorFactory.createError("DataProvidedIsNotValid", {
          error: validate.error,
        }),
      },
      { status: 400 }
    );
  }

  const existInWaitingList = await prisma?.waitingListDesktop.findUnique({
    where: {
      email: validate.data.email,
    },
  });

  if (existInWaitingList) {
    return NextResponse.json(
      {
        message: "success",
        response: true,
        user: existInWaitingList,
      },
      { status: 200 }
    );
  }

  const addIntoWaitingList = await prisma?.waitingListDesktop.create({
    data: {
      email: validate.data.email,
    },
  });

  return NextResponse.json(
    {
      message: "success",
      response: true,
      user: addIntoWaitingList,
    },
    { status: 200 }
  );
}
