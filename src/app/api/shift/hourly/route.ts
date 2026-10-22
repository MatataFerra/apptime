import { NextRequest, NextResponse } from "next/server";

import { getRequestSession } from "@/utils/auth/session";

import prisma from "#/prisma/client";

export async function GET(req: NextRequest) {
  const checkToken = (await getRequestSession(req))?.user ?? null;

  if (!checkToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!checkToken.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // One query, no transaction: it's a read, and an interactive transaction
  // over Turso could hit Prisma's 5 s timeout.
  const hourly = await prisma.hourly.findMany({
    where: { shift: { user: { email: checkToken.email } } },
    include: { taxes: true },
  });

  if (!hourly) {
    return NextResponse.json({ message: "Something went wrong", hourly }, { status: 400 });
  }

  return NextResponse.json(
    {
      message: "success",
      response: true,
      hourly,
    },
    { status: 200 }
  );
}
