import { isWeekend, parseISO, subDays } from "date-fns";

import { isCurrency } from "@/utils/constants/currencies";

import "server-only";

import {
  dayKey,
  daysBetween,
  fillDays,
  parseRates,
  RATE_BASE,
  type RateRow,
  toTable,
} from "./convert";
import prisma from "#/prisma/client";

const API = "https://api.frankfurter.dev/v2/rates";

/**
 * Weekdays filled in this recently are fetched again (today's rate comes
 * out in the afternoon), at most once an hour per server instance.
 */
const REFRESH_FILLED_DAYS = 3;
const RETRY_AFTER_MS = 60 * 60 * 1000;
let lastAttempt = 0;

async function fetchRates(from: string, to: string, quotes: string[]): Promise<RateRow[]> {
  const url = `${API}?base=${RATE_BASE}&quotes=${quotes.join(",")}&from=${from}&to=${to}`;
  const response = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(8000) });
  if (!response.ok) throw new Error(`Frankfurter ${response.status}`);
  return parseRates(await response.json());
}

/**
 * Rates for every day from `from` to `to` (YYYY-MM-DD), EUR based. Read
 * from the ExchangeRate table; days that aren't there yet (or were only
 * filled in recently) are fetched from Frankfurter once and stored. If the
 * API is down, whatever is stored is returned.
 */
export async function getRateTable(from: string, to: string, quotes: string[]) {
  // Only the currencies the app offers. A code Frankfurter doesn't publish
  // never gets a stored row, so it kept every day "missing": each request
  // skipped the hourly throttle, fetched the whole range again and rewrote
  // it. Unsupported codes just get no rates (the client shows them as-is).
  const wanted = [...new Set(quotes.map((q) => q.toUpperCase()))].filter(
    (q) => q !== RATE_BASE && isCurrency(q)
  );
  if (wanted.length === 0) return {};

  const stored = await prisma.exchangeRate.findMany({
    where: { date: { gte: from, lte: to }, quote: { in: wanted } },
  });
  const have = new Set(stored.filter((r) => !r.filled).map((r) => `${r.date}|${r.quote}`));
  const filled = new Set(stored.filter((r) => r.filled).map((r) => `${r.date}|${r.quote}`));
  const refreshFrom = dayKey(subDays(new Date(), REFRESH_FILLED_DAYS));

  const missing = daysBetween(from, to).filter((day) =>
    wanted.some((q) => {
      const key = `${day}|${q}`;
      if (have.has(key)) return false;
      if (!filled.has(key)) return true;
      return day >= refreshFrom && !isWeekend(parseISO(day));
    })
  );

  const onlyRefresh = missing.every((day) =>
    wanted.every((q) => filled.has(`${day}|${q}`) || have.has(`${day}|${q}`))
  );
  const tooSoon = onlyRefresh && Date.now() - lastAttempt < RETRY_AFTER_MS;

  if (missing.length > 0 && !tooSoon) {
    lastAttempt = Date.now();
    const start = missing[0];
    const end = missing[missing.length - 1];
    // A week before, so the first days can repeat the last published rate.
    const fetchFrom = dayKey(subDays(new Date(`${start}T12:00:00`), 7));
    try {
      const published = await fetchRates(fetchFrom, end, wanted);
      const rows = fillDays(published, start, end, wanted);
      if (rows.length > 0) {
        await prisma.$transaction([
          prisma.exchangeRate.deleteMany({
            where: { date: { gte: start, lte: end }, quote: { in: wanted } },
          }),
          prisma.exchangeRate.createMany({ data: rows }),
        ]);
      }
    } catch (error) {
      // eslint-disable-next-line no-console -- rates are optional, log and go on
      console.error("[exchange-rates]", error);
    }
  }

  const rows = await prisma.exchangeRate.findMany({
    where: { date: { gte: from, lte: to }, quote: { in: wanted } },
    select: { date: true, quote: true, rate: true },
  });
  return toTable(rows);
}
