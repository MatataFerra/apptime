import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import Password from "@/services/Auth/password";
import ErrorFactory from "@/services/Error/factory";
import UserService from "@/services/User";

import { LoginInputs } from "@/types";

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export default async function POST(req: NextRequest) {
  return NextResponse.json({
    message: "Not Implemented",
  });
  // const body: LoginInputs = await req.json();
  // const parseBody = LoginSchema.safeParse(body);

  // if (!parseBody.success) {
  //   return NextResponse.json(
  //     {
  //       ...ErrorFactory.createError("DataProvidedIsNotValid", {
  //         error: parseBody.error,
  //       }),
  //       response: false,
  //     },
  //     {
  //       status: 400,
  //     }
  //   );
  // }

  // const user = await UserService.findUniqueUser({ email: parseBody.data.email });

  // if (!user) {
  //   return NextResponse.json(
  //     {
  //       ...ErrorFactory.createError("UserNotFound"),
  //       response: false,
  //     },
  //     {
  //       status: 400,
  //     }
  //   );
  // }

  // const checkPasswords = await Password.comparePassword(
  //   parseBody.data.password,
  //   user.password ?? ""
  // );

  // if (!checkPasswords) {
  //   return NextResponse.json(
  //     {
  //       ...ErrorFactory.createError("PasswordIsNotValid"),
  //       response: false,
  //     },
  //     {
  //       status: 400,
  //     }
  //   );
  // }
}
