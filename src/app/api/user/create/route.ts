import { AuthService, ErrorFactory, PasswordService, UserService } from "@/services";
import _ from "lodash";
import { UserCreateSchema } from "@/types";
import { User } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { Exception } from "@/services/Error/factory";

export async function POST(req: NextRequest) {
  const body: User = await req.json();
  const parsedBody = UserCreateSchema.safeParse(body);

  if (!parsedBody.success) {
    return NextResponse.json(
      {
        ...ErrorFactory.createError("DataProvidedIsNotValid", {
          error: parsedBody.error,
        }),
        response: false,
      },
      { status: 400 }
    );
  }

  try {
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
      const exception = _.cloneDeep(error) as Exception;
      return NextResponse.json(
        {
          ...ErrorFactory.findAndCreateError(exception.type_error).handleError(error),
          response: false,
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        ...ErrorFactory.createError("InternalServer", { error }),
        response: false,
      },
      { status: 500 }
    );
  }
}
