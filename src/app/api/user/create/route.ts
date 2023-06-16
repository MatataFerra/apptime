import {
  AuthService,
  ErrorFactory,
  PasswordService,
  UserService,
} from "@/services";
import { UserCreateSchema } from "@/types";
import { User } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

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
    const user = await UserService.findUniqueUserByEmail(parsedBody.data.email);
    if (user) {
      return NextResponse.json(
        {
          ...ErrorFactory.createError("UserAlreadyExists"),
          response: false,
        },
        { status: 400 }
      );
    }

    const validatePassword = PasswordService.validatePassword(
      parsedBody.data.password
    );

    if (!validatePassword.valid) {
      return NextResponse.json(
        {
          ...ErrorFactory.createError("PasswordIsNotValid", {
            error: validatePassword.error,
          }),
          response: false,
        },
        { status: 400 }
      );
    }

    const hashPassword = await PasswordService.hashPassword(
      validatePassword.password
    );
    const newUser = await AuthService.register({
      ...parsedBody.data,
      password: hashPassword,
      email: parsedBody.data.email,
      type_account: "CREDENTIALS",
      name: parsedBody.data.name,
    });

    return NextResponse.json(
      {
        message: "success",
        response: true,
        user: newUser,
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
