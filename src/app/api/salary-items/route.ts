import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

import prisma from "#/prisma/client";

/** Flattens the relation counts into how many shifts use the item. */
function withUses<T extends { _count: { hourly: number; production: number } }>({
  _count,
  ...item
}: T) {
  return { ...item, uses: _count.hourly + _count.production };
}

export async function GET(req: NextRequest) {
  const checkToken = await getToken({ req });

  if (!checkToken?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // The user's own taxes and contributions. Removed ones stay on the
  // shifts that used them but are no longer offered.
  const query = {
    where: { user: { email: checkToken.email }, archived: false },
    orderBy: { name: "asc" as const },
    include: { _count: { select: { hourly: true, production: true } } },
  };

  try {
    const [contributionRows, taxRows] = await prisma.$transaction([
      prisma.contribution.findMany(query),
      prisma.tax.findMany(query),
    ]);
    const contributions = contributionRows.map(withUses);
    const taxes = taxRows.map(withUses);

    return NextResponse.json({
      salaryItems: { contributions, taxes },
      response: true,
      message: "success",
    });
  } catch {
    return NextResponse.json({ error: "Something went wrong", response: false }, { status: 500 });
  }
}
