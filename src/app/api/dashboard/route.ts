import { NextRequest, NextResponse } from "next/server";

import DashboardService from "@/services/Dashboard";
import ErrorFactory from "@/services/Error/factory";

import { QUERY_PARAMS } from "@/utils/constants";

import prisma from "#/prisma/client";

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get(QUERY_PARAMS.USER_ID);

  if (!userId) {
    return NextResponse.json(
      {
        error: ErrorFactory.createError("QueryNotProvided"),
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
        shifts: {
          include: {
            hourly: {
              include: {
                taxes: true,
              },
            },
            production: {
              include: {
                taxes: true,
              },
            },
          },
        },
        profile: true,
        config: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          error: ErrorFactory.createError("UserNotFound"),
          response: false,
        },
        { status: 404 }
      );
    }

    if (!user.shifts?.hourly) {
      return NextResponse.json(
        {
          error: ErrorFactory.createError("CustomError", {
            message: "No shifts found",
          }),
          response: false,
        },
        { status: 404 }
      );
    }

    const dashboardService = new DashboardService(user.shifts?.hourly, user.shifts?.production);

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
        error: ErrorFactory.createError("InternalServer"),
        response: false,
      },
      { status: 500 }
    );
  }
}
