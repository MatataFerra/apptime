import { NextResponse } from "next/server";

import ErrorFactory from "@/services/Error/factory";
import UserService from "@/services/User";

export async function GET(request: Request) {
  const user = await UserService.authenticatedUser();

  if (!user) {
    return NextResponse.json(
      {
        ...ErrorFactory.createError("UserNotFound"),
      },
      {
        status: 401,
      }
    );
  }

  const isAdmin = new UserService(user).isAdmin();

  if (!isAdmin) {
    return NextResponse.json({
      message: "UserNotAllowed",
    });
  }

  return NextResponse.json({
    isAdmin,
  });
}
