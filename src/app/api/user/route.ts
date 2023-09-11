import { NextRequest, NextResponse } from "next/server";

import ErrorFactory from "@/services/Error/factory";

import { SearchParamsSchema } from "@/types";

import { QUERY_PARAMS } from "@/utils/constants";

import prisma from "#/prisma/client";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
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

    if (!user) {
      return NextResponse.json(
        {
          ...ErrorFactory.createError("UserNotFound"),
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
    return NextResponse.json(
      {
        ...ErrorFactory.createError("InternalServer", { error }),
        response: false,
      },
      { status: 500 }
    );
  }
}
