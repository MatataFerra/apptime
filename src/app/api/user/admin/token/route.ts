import { User } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

import ApiGateway from "@/services/Api/Gateway";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const user = (await req.json()) as User;
  const searchParams = req.nextUrl.searchParams;
  const token = searchParams.get("token") ?? "";

  const createToken = await ApiGateway.requestToken({ user, token });

  if (!createToken.ok) {
    const { ok, ...rest } = createToken;
    return NextResponse.json(
      {
        ...rest,
        response: ok,
      },
      {
        status: 401,
      }
    );
  }

  const { ok, ...rest } = createToken;

  return NextResponse.json({
    ...rest,
    response: ok,
  });
}
