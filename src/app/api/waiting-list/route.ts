import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import ErrorFactory from "@/services/Error/factory";
import { clientIp, consumeRateLimit } from "@/services/RateLimit";

import prisma from "#/prisma/client";

/** No sign-in here: per IP, enough for a few people sharing a network. */
const PER_IP = { window: 60 * 60, max: 10 };

const WaitingListSchema = z.object({ email: z.string().trim().toLowerCase().email().max(254) });

/**
 * Adds an email to the desktop waiting list. There's no GET: the list is
 * read from the database, never through the API (it used to be public).
 * The answer is the same whether the email was already there or not, so
 * it doesn't tell who signed up.
 */
export async function POST(req: NextRequest) {
  if (!(await consumeRateLimit(`waiting-list:ip:${clientIp(req.headers)}`, PER_IP))) {
    return NextResponse.json(
      { error: "Too many requests", response: false },
      { status: 429, headers: { "Retry-After": String(PER_IP.window) } }
    );
  }

  const body = await req.json().catch(() => null);
  const validate = WaitingListSchema.safeParse(body);

  if (!validate.success) {
    return NextResponse.json(
      {
        ...ErrorFactory.createError("DataProvidedIsNotValid", {
          error: validate.error,
        }),
      },
      { status: 400 }
    );
  }

  try {
    const { email } = validate.data;
    await prisma.waitingListDesktop.upsert({ where: { email }, create: { email }, update: {} });

    return NextResponse.json({ message: "success", response: true }, { status: 200 });
  } catch (error) {
    // eslint-disable-next-line no-console -- server log for failed sign-ups
    console.error("[api/waiting-list]", error);
    return NextResponse.json(
      { error: ErrorFactory.createError("InternalServer"), response: false },
      { status: 500 }
    );
  }
}
