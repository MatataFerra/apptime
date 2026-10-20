import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

import prisma from "#/prisma/client";

/** Flattens the relation counts into how many shifts use the item. */
/**
 * How many shifts use the item. Counted from the ids rather than with
 * `_count`: on Turso a zero count comes back as NULL and Prisma 5 throws.
 */
function withUses<T extends { hourly: { id: number }[]; production: { id: number }[] }>({
  hourly,
  production,
  ...item
}: T) {
  return { ...item, uses: hourly.length + production.length };
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
    include: { hourly: { select: { id: true } }, production: { select: { id: true } } },
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
  } catch (error) {
    // eslint-disable-next-line no-console -- server log for failed saves
    console.error("[api/salary-items]", error);
    return NextResponse.json({ error: "Something went wrong", response: false }, { status: 500 });
  }
}
