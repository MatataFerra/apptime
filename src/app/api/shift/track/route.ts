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

  const track = await prisma?.$transaction(async (ctx) => {
    const email = checkToken?.email;

    if (!email) {
      return {
        response: false,
      };
    }

    const hourlies = await ctx?.hourly.findMany({
      where: {
        shift: {
          user: {
            email,
          },
        },
      },
      include: {
        taxes: true,
      },
    });

    const trackShift = hourlies.find((shift) => shift.endDate === null) ?? null;

    const orderShifts = ShiftService.sortAllShifts(
      hourlies.map((s) => ({ ...s, type: "hourly" })),
      {
        desc: false,
      }
    );

    const last = orderShifts?.filter((shift) => shift.endDate !== null).at(-1);

    const earnings = hourlies.reduce((acc, shift) => {
      if (shift?.isClosed) {
        acc += new ShiftService(shift).calculateEarnings();
      }

      return acc;
    }, 0);

    return {
      shift: trackShift,
      last,
      earnings,
    };
  });

  console.log("🚀 ~ GET ~ track:", track);

  return NextResponse.json(
    {
      message: isEmpty(track) ? "No track has been found" : "success",
      response: true,
      track: track,
    },
    { status: 200 }
  );
}
