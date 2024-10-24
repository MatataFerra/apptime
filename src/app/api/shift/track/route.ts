import isEmpty from "lodash/isEmpty";
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

import ShiftService from "@/services/Shift";

import prisma from "#/prisma/client";

export const maxDuration = 15;

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

    return hourlies;
  });

  return NextResponse.json(
    {
      message: isEmpty(track) ? "No track has been found" : "success",
      response: true,
      track: track,
    },
    { status: 200 }
  );
}
