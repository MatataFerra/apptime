import { User } from "@prisma/client";
import _ from "lodash";
import { NextRequest, NextResponse } from "next/server";

import AuthService from "@/services/Auth";
import ErrorFactory from "@/services/Error/factory";

import { UserCreateSchema } from "@/types";

export async function POST(req: NextRequest) {
  const body: User = await req.json();
  try {
    const parsedBody = UserCreateSchema.safeParse(body);

    if (!parsedBody.success) {
      throw ErrorFactory.createError("DataProvidedIsNotValid", {
        error: parsedBody.error,
      });
    }

    const newUser = await new AuthService({
      ...parsedBody.data,
    }).register();

    return NextResponse.json(
      {
        message: "success",
        response: true,
        user: newUser,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    if (_.has(error, "type_error")) {
      return NextResponse.json(
        {
          error,
          response: false,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: ErrorFactory.createError("InternalServer", { error }),
        response: false,
      },
      { status: 500 }
    );
  }
}
