import { beforeEach, describe, expect, test, vi } from "vitest";

type Row = { date: string; quote: string; rate: number; filled: boolean };
type Where = { date: { gte: string; lte: string }; quote: { in: string[] } };

// In-memory ExchangeRate table with write counters.
const db = vi.hoisted(() => {
  const state = { rows: [] as Row[], deleted: 0, created: 0 };
  function match(r: Row, where: Where) {
    return r.date >= where.date.gte && r.date <= where.date.lte && where.quote.in.includes(r.quote);
  }
  return {
    state,
    exchangeRate: {
      findMany: vi.fn(async ({ where }) => state.rows.filter((r) => match(r, where))),
      deleteMany: vi.fn(({ where }) => () => {
        const before = state.rows.length;
        state.rows = state.rows.filter((r) => !match(r, where));
        state.deleted += before - state.rows.length;
      }),
      createMany: vi.fn(({ data }) => () => {
        state.rows.push(...data);
        state.created += data.length;
      }),
    },
    $transaction: vi.fn(async (ops: (() => void)[]) => ops.forEach((op) => op())),
  };
});

vi.mock("#/prisma/client", () => ({ default: db }));

const PUBLISHED = ["USD", "GBP", "AUD", "NZD", "CAD", "CHF"];

// Frankfurter stand-in: answers 200 and leaves out codes it doesn't publish.
const fetchMock = vi.fn(async (url: string) => {
  const u = new URL(url);
  const quotes = u.searchParams
    .get("quotes")!
    .split(",")
    .filter((q) => PUBLISHED.includes(q));
  const rows: { date: string; base: string; quote: string; rate: number }[] = [];
  const end = new Date(`${u.searchParams.get("to")}T12:00:00Z`);
  for (
    let d = new Date(`${u.searchParams.get("from")}T12:00:00Z`);
    d <= end;
    d.setUTCDate(d.getUTCDate() + 1)
  ) {
    if (d.getUTCDay() === 0 || d.getUTCDay() === 6) continue;
    for (const quote of quotes)
      rows.push({ date: d.toISOString().slice(0, 10), base: "EUR", quote, rate: 1.1 });
  }
  return { ok: true, status: 200, json: async () => rows } as Response;
});

let getRateTable: typeof import("@/services/ExchangeRates").getRateTable;

beforeEach(async () => {
  vi.resetModules(); // fresh per-instance throttle (lastAttempt) every test
  vi.stubGlobal("fetch", fetchMock);
  fetchMock.mockClear();
  Object.assign(db.state, { rows: [], deleted: 0, created: 0 });
  ({ getRateTable } = await import("@/services/ExchangeRates"));
});

const FROM = "2026-09-01";
const TO = "2026-09-30";

describe("getRateTable with currencies the app doesn't offer", () => {
  test("they never reach Frankfurter", async () => {
    await getRateTable(FROM, TO, ["USD", "XYZ", "CAD"]);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(new URL(fetchMock.mock.calls[0][0]).searchParams.get("quotes")).toBe("USD");
  });

  test("a repeat request is served from the table: no fetch, no rewrite", async () => {
    await getRateTable(FROM, TO, ["USD", "GBP", "XYZ"]);
    const { deleted, created } = db.state;
    fetchMock.mockClear();

    const table = await getRateTable(FROM, TO, ["USD", "GBP", "XYZ"]);

    expect(fetchMock).not.toHaveBeenCalled();
    expect(db.state.deleted).toBe(deleted);
    expect(db.state.created).toBe(created);
    expect(table["2026-09-15"]).toEqual({ USD: 1.1, GBP: 1.1 });
  });

  test("only unsupported codes: nothing is fetched or written", async () => {
    expect(await getRateTable(FROM, TO, ["XYZ", "CAD"])).toEqual({});
    expect(fetchMock).not.toHaveBeenCalled();
    expect(db.state.created).toBe(0);
  });
});
