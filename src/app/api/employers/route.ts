import { NextRequest, NextResponse } from "next/server";

import { getRequestSession } from "@/utils/auth/session";

import prisma from "#/prisma/client";

/**
 * The signed-in user's employers, A to Z, with how many shifts each has.
 * Archived ones come too, so old shifts can still show their name; the
 * list and the pickers leave them out.
 */
export async function GET(req: NextRequest) {
  const userId = (await getRequestSession(req))?.user.id ?? null;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const rows = await prisma.employer.findMany({
      where: { userId },
      orderBy: { name: "asc" },
      omit: { userId: true },
      include: { _count: { select: { hourly: true, production: true } } },
    });
    const employers = rows.map(({ _count, ...employer }) => ({
      ...employer,
      shifts: _count.hourly + _count.production,
    }));

    return NextResponse.json({ employers, response: true, message: "success" });
  } catch (error) {
    // eslint-disable-next-line no-console -- server log for failed reads
    console.error("[api/employers]", error);
    return NextResponse.json({ error: "Something went wrong", response: false }, { status: 500 });
  }
}
