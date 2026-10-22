import { NextRequest, NextResponse } from "next/server";

import { getRequestSession } from "@/utils/auth/session";

import prisma from "#/prisma/client";

export async function GET(req: NextRequest) {
  const checkToken = (await getRequestSession(req))?.user ?? null;

  if (!checkToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!checkToken.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // One query, no transaction: it's a read, and an interactive transaction
  // over Turso could hit Prisma's 5 s timeout.
  const production = await prisma.production.findMany({
    where: { shift: { userId: checkToken.id } },
    include: { taxes: true },
  });

  if (!production) {
    return NextResponse.json({ message: "Something went wrong", production }, { status: 400 });
  }

  return NextResponse.json(
    {
      message: "success",
      response: true,
      production: production,
    },
    { status: 200 }
  );
}
