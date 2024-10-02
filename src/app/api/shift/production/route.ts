import { Prisma, Production } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

import ErrorFactory from "@/services/Error/factory";
import ShiftService from "@/services/Shift";

import { ProductionCreateSchema } from "@/types";

export async function POST(req: NextRequest) {
  const body: Production = await req.json();
  const parsedBody = ProductionCreateSchema.safeParse(body);

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

  if (!parsedBody.data.shiftId) {
    return NextResponse.json(
      {
        error: ErrorFactory.createError("BodyNotProvided"),
        response: false,
      },
      { status: 400 }
    );
  }
  const shiftTransform = new ShiftService(body).checkPublicHoliday().build<Production>();

  try {
    const shift = await new ShiftService(shiftTransform).create();

    return NextResponse.json(
      {
        message: "success",
        response: true,
        shift,
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof Prisma.PrismaClientValidationError) {
      return NextResponse.json(
        {
          error: ErrorFactory.createError("PrismaClientFields", { message: error.message }),
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

export async function GET(req: NextRequest) {
  const checkToken = await getToken({ req });

  if (!checkToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const production = await prisma?.$transaction(async (ctx) => {
    const email = checkToken?.email;

    if (!email) {
      return {
        response: false,
        message: "Email not found",
      };
    }

    const user = await ctx?.user.findUnique({
      where: {
        email: email,
      },
      include: {
        shifts: true,
      },
    });

    if (!user) {
      return {
        response: false,
        message: "User not found",
      };
    }

    const productionShifts = await ctx?.production.findMany({
      where: {
        shiftId: user?.shifts?.id,
      },
      include: {
        taxes: true,
      },
    });

    return productionShifts;
  });

  if (!production) {
    return NextResponse.json(production, { status: 400 });
  }

  return NextResponse.json(
    {
      message: "success",
      response: true,
      production: production,
    },
    { status: 200 }
  );
}
