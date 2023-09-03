import { NextRequest, NextResponse } from "next/server";

import { DashboardService, ErrorFactory } from "@/services";

import { QUERY_PARAMS } from "@/utils/constants";

import prisma from "#/prisma/client";

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get(QUERY_PARAMS.USER_ID);

  if (!userId) {
    return NextResponse.json(
      {
        ...ErrorFactory.createError("QueryNotProvided"),
        response: false,
      },
      { status: 404 }
    );
  }

  try {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },

      include: {
        shifts: true,
        profile: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          ...ErrorFactory.createError("UserNotFound"),
          response: false,
        },
        { status: 404 }
      );
    }

    const dashboardService = new DashboardService(user);

    return NextResponse.json({
      message: "success",
      response: true,
      data: {
        ...dashboardService.dashboardData(),
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        ...ErrorFactory.createError("InternalServer"),
        response: false,
      },
      { status: 500 }
    );
  }
}
