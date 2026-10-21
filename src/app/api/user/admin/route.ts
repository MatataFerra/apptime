import { NextRequest, NextResponse } from "next/server";

import ApiGateway from "@/services/Api/Gateway";
import ErrorFactory from "@/services/Error/factory";

import { UserCreateSafeAdminSchema } from "@/types";

import { auth } from "@/utils/auth";

import prisma from "#/prisma/client";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const user = await req.json();
  const token = searchParams.get("token") ?? "";
  const parseData = UserCreateSafeAdminSchema.safeParse(user);

  if (!parseData.success) {
    return NextResponse.json(
      {
        error: ErrorFactory.createError("DataProvidedIsNotValid", {
          error: parseData.error,
        }),
        response: false,
      },
      {
        status: 400,
      }
    );
  }

  const isTokenValid = await ApiGateway.checkToken({ token });

  if (!isTokenValid.ok) {
    const { ok, ...rest } = isTokenValid;
    return NextResponse.json(
      {
        ...rest,
        response: ok,
      },
      {
        status: 400,
      }
    );
  }

  // Created through Better Auth so the password ends up hashed in Account.
  const { email, password, name, role } = parseData.data;
  const created = await auth.api.signUpEmail({ body: { email, password, name } }).catch(() => null);

  if (!created) {
    return NextResponse.json({
      error: ErrorFactory.createError("CustomError", {
        message: "Error creating user",
      }),

      response: false,
    });
  }

  const userCreated = await prisma.user.update({
    where: { id: created.user.id },
    data: { role },
  });

  return NextResponse.json(
    {
      message: "User admin created",
      response: true,
      user: userCreated,
    },
    {
      status: 201,
    }
  );
}
