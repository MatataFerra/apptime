import { NextRequest, NextResponse } from "next/server";

import ErrorFactory from "@/services/Error/factory";
import UserService from "@/services/User";

import { SearchParamsSchema } from "@/types";

import { getRequestSession } from "@/utils/auth/session";
import { QUERY_PARAMS } from "@/utils/constants";

import prisma from "#/prisma/client";

type SessionUser = { email: string; role?: string | null };

function parseEmailFromParams(token: SessionUser | null, email: string | null) {
  if (token?.role !== "ADMIN") return token?.email;
  return email;
}

export async function GET(req: NextRequest) {
  const checkToken = (await getRequestSession(req))?.user ?? null;

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

    // Your own user by id (the session's email can be stale); admins can
    // ask for anyone by email.
    const emailParam = searchParams.get(QUERY_PARAMS.EMAIL);
    const where =
      checkToken.role === "ADMIN" && emailParam ? { email: emailParam } : { id: checkToken.id };

    const user = await prisma.user.findUnique({
      where,
      include: {
        // The client expects user.shifts.hourly / user.shifts.production (UserType),
        // so include the shift lists, not just the Shifts row.
        shifts: JSON.parse(parsedSearchParams.data.shifts ?? "false")
          ? { include: { hourly: true, production: true } }
          : false,
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
      // The password hash never leaves the server (it used to for an admin reading their own user).
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

    if (parsedSearchParams.data.email && onlyParam.length > 0) {
      const userFiltered = await UserService.filterUserProps(
        user,
        onlyParam.filter((prop) => prop !== "password")
      );

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
        user: await UserService.removeProps(user, ["password"]),
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
