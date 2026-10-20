import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

import prisma from "#/prisma/client";

export async function GET(req: NextRequest) {
  const checkToken = await getToken({ req });

  if (!checkToken?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Only the taxes and contributions used in this user's own shifts.
  // (It used to return every user's.)
  const mine = {
    OR: [
      { hourly: { some: { shift: { user: { email: checkToken.email } } } } },
      { production: { some: { shift: { user: { email: checkToken.email } } } } },
    ],
  };

  try {
    const [contributions, taxes] = await prisma.$transaction([
      prisma.contribution.findMany({ where: mine }),
      prisma.tax.findMany({ where: mine }),
    ]);

    return NextResponse.json({
      salaryItems: { contributions, taxes },
      response: true,
      message: "success",
    });
  } catch {
    return NextResponse.json({ error: "Something went wrong", response: false }, { status: 500 });
  }
}
