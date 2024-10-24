import isEmpty from "lodash/isEmpty";
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

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

      take: -10,
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
