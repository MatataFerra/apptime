import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

import prisma from "#/prisma/client";

export async function GET(req: NextRequest) {
  const checkToken = await getToken({ req });

  if (!checkToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tax = await prisma.tax.findMany({
    include: {
      hourly: true,
      production: true,
    },
  });

  return NextResponse.json({ tax, response: true });
}
