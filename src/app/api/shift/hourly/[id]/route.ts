import { NextRequest, NextResponse } from "next/server";

import ErrorFactory from "@/services/Error/factory";

import { RouteParams } from "@/types";

import { getRequestUserId } from "@/utils/auth/session";

import prisma from "#/prisma/client";

/** Deletes one of the signed-in user's hourly shifts. Someone else's is "not found". */
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  const userId = await getRequestUserId(req);

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized", response: false }, { status: 401 });
  }

  const id = Number((await params).id);

  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json(
      { error: ErrorFactory.createError("ShiftNotFound"), response: false },
      { status: 404 }
    );
  }

  try {
    const owned = await prisma.hourly.findFirst({ where: { id, shift: { userId } } });

    if (!owned) {
      return NextResponse.json(
        { error: ErrorFactory.createError("ShiftNotFound"), response: false },
        { status: 404 }
      );
    }

    const deletedShift = await prisma.hourly.delete({ where: { id: owned.id } });

    return NextResponse.json(
      { message: "success", response: true, shift: deletedShift },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { error: ErrorFactory.createError("InternalServer"), response: false },
      { status: 500 }
    );
  }
}
