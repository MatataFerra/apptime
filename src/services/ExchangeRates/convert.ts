import { addDays, format, parseISO } from "date-fns";

/** Rates per day, EUR based: table["2026-10-21"].USD = 1.1228 (EUR is 1). */
export type RateTable = Record<string, Record<string, number>>;

export type RateRow = { date: string; quote: string; rate: number };

export const RATE_BASE = "EUR";

/** The calendar day of a date where the user is, as the table keys it. */
export function dayKey(date: Date) {
  return format(date, "yyyy-MM-dd");
}

/** Every calendar day from `from` to `to` (YYYY-MM-DD), both included. */
export function daysBetween(from: string, to: string) {
  const days: string[] = [];
  for (let d = parseISO(from); dayKey(d) <= to; d = addDays(d, 1)) days.push(dayKey(d));
  return days;
}

/**
 * Rows from a Frankfurter response. v2 answers a list of
 * `{ date, base, quote, rate }`; the older `{ rates: { date: { USD } } }`
 * and `{ date, rates: { USD } }` shapes are read too.
 */
export function parseRates(json: unknown): RateRow[] {
  const rows: RateRow[] = [];
  function push(date: unknown, quote: unknown, rate: unknown) {
    if (
      typeof date === "string" &&
      /^\d{4}-\d{2}-\d{2}$/.test(date) &&
      typeof quote === "string" &&
      typeof rate === "number" &&
      Number.isFinite(rate) &&
      rate > 0
    ) {
      rows.push({ date, quote: quote.toUpperCase(), rate });
    }
  }

  if (Array.isArray(json)) {
    for (const row of json) {
      if (row && typeof row === "object" && (row.base ?? RATE_BASE) === RATE_BASE) {
        push(row.date, row.quote, row.rate);
      }
    }
    return rows;
  }

  if (json && typeof json === "object" && "rates" in json) {
    const { rates, date } = json as { rates: Record<string, unknown>; date?: string };
    for (const [key, value] of Object.entries(rates ?? {})) {
      if (value && typeof value === "object") {
        // { "2026-10-20": { USD: 1.1 } }
        for (const [quote, rate] of Object.entries(value)) push(key, quote, rate);
      } else {
        // { date: "2026-10-20", rates: { USD: 1.1 } }
        push(date, key, value);
      }
    }
  }
  return rows;
}

/**
 * One rate per calendar day and currency from `from` to `to`. Days without
 * a published rate (weekends, holidays, today before it's out) repeat the
 * last published one and come back as `filled`.
 */
export function fillDays(rows: RateRow[], from: string, to: string, quotes: string[]) {
  const byQuote = new Map<string, RateRow[]>();
  for (const row of rows) {
    const list = byQuote.get(row.quote) ?? [];
    list.push(row);
    byQuote.set(row.quote, list);
  }

  const out: (RateRow & { filled: boolean })[] = [];
  for (const quote of quotes) {
    const published = (byQuote.get(quote) ?? []).sort((a, b) => a.date.localeCompare(b.date));
    let i = 0;
    let last: RateRow | undefined;
    for (const day of daysBetween(from, to)) {
      while (i < published.length && published[i].date <= day) last = published[i++];
      if (!last) continue; // nothing published yet on or before this day
      out.push({ date: day, quote, rate: last.rate, filled: last.date !== day });
    }
  }
  return out;
}

/** Turns rows into a table: table[date][quote] = rate. */
export function toTable(rows: RateRow[]): RateTable {
  const table: RateTable = {};
  for (const { date, quote, rate } of rows) (table[date] ??= {})[quote] = rate;
  return table;
}

/**
 * Converts amounts between currencies with the rate of a given day: the
 * day itself, else the closest earlier day in the table, else the closest
 * later one. Returns null when the table has no rate for a currency.
 */
export function makeConverter(table: RateTable) {
  const days = Object.keys(table).sort();

  function rateOn(day: string, code: string): number | null {
    if (code === RATE_BASE) return 1;
    const exact = table[day]?.[code];
    if (exact) return exact;
    let earlier: number | null = null;
    let later: number | null = null;
    for (const d of days) {
      const rate = table[d][code];
      if (!rate) continue;
      if (d <= day) earlier = rate;
      else if (later === null) {
        later = rate;
        break;
      }
    }
    return earlier ?? later;
  }

  return function convert(amount: number, from: string, to: string, day: string) {
    if (from === to) return amount;
    const fromRate = rateOn(day, from);
    const toRate = rateOn(day, to);
    if (!fromRate || !toRate) return null;
    return (amount / fromRate) * toRate;
  };
}
