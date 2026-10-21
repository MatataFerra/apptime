import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { getRateTable } from "@/services/ExchangeRates";
import { dayKey } from "@/services/ExchangeRates/convert";

import { getRequestSession } from "@/utils/auth/session";

const Day = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const Query = z.object({
  from: Day,
  to: Day,
  quotes: z
    .string()
    .regex(/^[A-Za-z]{3}(,[A-Za-z]{3}){0,9}$/)
    .transform((value) => value.split(",")),
});

/**
 * Daily exchange rates (EUR based) for the days and currencies asked,
 * from the ExchangeRate table (filled from Frankfurter as needed).
 */
export async function GET(req: NextRequest) {
  if (!(await getRequestSession(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = Query.safeParse(Object.fromEntries(req.nextUrl.searchParams));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid query" }, { status: 400 });
  }

  const today = dayKey(new Date());
  const from = parsed.data.from < "1999-01-04" ? "1999-01-04" : parsed.data.from;
  const to = parsed.data.to > today ? today : parsed.data.to;
  if (from > to) return NextResponse.json({ base: "EUR", rates: {} });

  const rates = await getRateTable(from, to, parsed.data.quotes);
  return NextResponse.json(
    { base: "EUR", rates },
    // Rates for past days don't change; the browser can keep them a while.
    { headers: { "Cache-Control": "private, max-age=3600" } }
  );
}
