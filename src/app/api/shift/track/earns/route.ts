import isEmpty from "lodash/isEmpty";
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

import ShiftService from "@/services/Shift";

import prisma from "#/prisma/client";

export async function GET(req: NextRequest) {
  const checkToken = await getToken({ req });

  if (!checkToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const earnings = await prisma?.$transaction(async (ctx) => {
    const email = checkToken?.email;

    if (!email) {
      return {
        response: false,
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
      };
    }

    const hourlies = await ctx?.hourly.findMany({
      where: {
        shiftId: user?.shifts?.id,
        endDate: {
          not: null,
        },
      },
      include: {
        taxes: true,
      },
      orderBy: {
        endDate: "desc",
      },
    });

    const earnings = hourlies.reduce((acc, shift) => {
      if (shift?.isClosed) {
        acc += new ShiftService(shift).calculateEarnings();
      }

      return acc;
    }, 0);

    return earnings;
  });

  return NextResponse.json(
    {
      message: isEmpty(earnings) ? "No shift has been found" : "success",
      response: true,
      earnings: earnings,
    },
    { status: 200 }
  );
}
