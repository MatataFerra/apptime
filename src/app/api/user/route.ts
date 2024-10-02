import { NextRequest, NextResponse } from "next/server";
import { getToken, type JWT } from "next-auth/jwt";

import ErrorFactory from "@/services/Error/factory";
import UserService from "@/services/User";

import { SearchParamsSchema } from "@/types";

import { QUERY_PARAMS } from "@/utils/constants";

import prisma from "#/prisma/client";

function parseEmailFromParams(token: JWT | null, email: string | null) {
  if (token?.role !== "ADMIN") return token?.email;
  return email;
}

export async function GET(req: NextRequest) {
  const checkToken = await getToken({ req });

  if (!checkToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = req.nextUrl.searchParams;
  const shifts = searchParams.get(QUERY_PARAMS.SHIFTS);
  const profile = searchParams.get(QUERY_PARAMS.PROFILE);
  const config = searchParams.get(QUERY_PARAMS.CONFIG);
  const email = parseEmailFromParams(checkToken, searchParams.get(QUERY_PARAMS.EMAIL));
  const only = searchParams.get(QUERY_PARAMS.ONLY);

  const parsedSearchParams = SearchParamsSchema.safeParse({
    shifts,
    config,
    profile,
    email,
    only,
  });

  if (!parsedSearchParams.success) {
    return NextResponse.json(
      {
        error: ErrorFactory.createError("DataProvidedIsNotValid", {
          error: parsedSearchParams.error,
        }),
        response: false,
      },
      { status: 400 }
    );
  }

  try {
    const { only } = parsedSearchParams.data;
    const onlyParam = only ? only.split(",") : [];

    const user = await prisma.user.findUnique({
      where: {
        email: parsedSearchParams?.data?.email ?? "",
      },
      include: {
        shifts: JSON.parse(parsedSearchParams.data.shifts ?? "false"),
        profile: JSON.parse(parsedSearchParams.data.profile ?? "false"),
        config: JSON.parse(parsedSearchParams.data.config ?? "false"),
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          error: ErrorFactory.createError("UserNotFound"),
          response: false,
        },
        { status: 400 }
      );
    }

    if (parsedSearchParams.data.email && onlyParam.length === 0) {
      if (user.role !== "ADMIN" || user.email !== checkToken?.email) {
        const userFiltered = await UserService.removeProps(user, ["password"]);
        return NextResponse.json(
          {
            message: "success",
            response: true,
            user: { ...userFiltered },
          },
          { status: 200 }
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
    }

    if (parsedSearchParams.data.email && onlyParam.length > 0) {
      const userFiltered = await UserService.filterUserProps(user, onlyParam);

      return NextResponse.json(
        {
          message: "success",
          response: true,
          user: userFiltered,
        },
        { status: 200 }
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
        error: ErrorFactory.createError("InternalServer", { error }),
        response: false,
      },
      { status: 500 }
    );
  }
}
