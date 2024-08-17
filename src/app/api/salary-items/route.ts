import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

import prisma from "#/prisma/client";

export async function GET(req: NextRequest) {
  const checkToken = await getToken({ req });

  if (!checkToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const contribution = prisma.contribution.findMany();

  const tax = prisma.tax.findMany();

  try {
    const [contributions, taxes] = await prisma.$transaction([contribution, tax]);

    return NextResponse.json({
      salaryItems: {
        contributions,
        taxes,
      },
      response: true,
      message: "success",
    });
  } catch (error) {
    return NextResponse.json({ error: "Something went wrong", response: false }, { status: 401 });
  }
}
