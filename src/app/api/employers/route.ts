import { NextRequest, NextResponse } from "next/server";

import { getRequestSession } from "@/utils/auth/session";

import prisma from "#/prisma/client";

/** The signed-in user's employers, A to Z. Archived ones are left out. */
export async function GET(req: NextRequest) {
  const userId = (await getRequestSession(req))?.user.id ?? null;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const employers = await prisma.employer.findMany({
      where: { userId, archived: false },
      orderBy: { name: "asc" },
      omit: { userId: true, archived: true },
    });

    return NextResponse.json({ employers, response: true, message: "success" });
  } catch (error) {
    // eslint-disable-next-line no-console -- server log for failed reads
    console.error("[api/employers]", error);
    return NextResponse.json({ error: "Something went wrong", response: false }, { status: 500 });
  }
}
