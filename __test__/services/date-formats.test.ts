import { format } from "date-fns";
import { enUS, es } from "date-fns/locale";
import { describe, expect, test } from "vitest";

import { datePattern, withDateFormats } from "@/utils/helpers/dateFormats";

const at = new Date(2026, 9, 23, 13, 5); // Fri 23 Oct 2026, 13:05

describe("withDateFormats", () => {
  test("auto keeps the language's own formats", () => {
    expect(withDateFormats(es, { time: "auto", date: "auto" })).toBe(es);
    expect(format(at, "p", { locale: es })).toBe("13:05");
    expect(format(at, "p", { locale: enUS })).toBe("1:05 PM");
  });

  test("Spanish with a 12 h clock (e.g. in Australia)", () => {
    const locale = withDateFormats(es, { time: "12", date: "auto" });
    expect(format(at, "p", { locale })).toBe("1:05 PM");
    // Day names stay in Spanish.
    expect(format(at, "EEEE", { locale })).toBe("viernes");
  });

  test("English with a 24 h clock", () => {
    const locale = withDateFormats(enUS, { time: "24", date: "auto" });
    expect(format(at, "p", { locale })).toBe("13:05");
    expect(format(at, "PP p", { locale })).toBe("Oct 23, 2026 13:05");
  });

  test("English, day first", () => {
    const locale = withDateFormats(enUS, { time: "auto", date: "dmy" });
    expect(format(at, "PP", { locale })).toBe("23 Oct 2026");
    expect(format(at, "P", { locale })).toBe("23/10/2026");
    expect(format(at, datePattern(locale, "weekdayDayMonth"), { locale })).toBe("Fri 23 Oct");
  });

  test("Spanish, month first", () => {
    const locale = withDateFormats(es, { time: "auto", date: "mdy" });
    expect(format(at, "P", { locale })).toBe("10/23/2026");
    expect(format(at, datePattern(locale, "dayMonth"), { locale })).toBe("oct 23");
    expect(format(at, datePattern(locale, "weekdayDayMonthTime"), { locale })).toBe(
      "vie, oct 23, 13:05"
    );
  });

  test("Spanish, day first keeps its own long forms", () => {
    const locale = withDateFormats(es, { time: "auto", date: "dmy" });
    expect(format(at, "PPP", { locale })).toBe(format(at, "PPP", { locale: es }));
  });
});

describe("datePattern", () => {
  test("day first unless month first is chosen", () => {
    expect(datePattern(enUS, "dayMonth")).toBe("d MMM");
    expect(datePattern(withDateFormats(enUS, { time: "auto", date: "mdy" }), "dayMonth")).toBe(
      "MMM d"
    );
  });
});
