import type { FormatLongFn, Locale as DateLocale } from "date-fns";
import { enUS, es } from "date-fns/locale";

export const DATE_LOCALES = { en: enUS, es } as const;

/** date-fns locale for an app locale (day and month names in `format`). */
export function dateLocaleFor(locale: string) {
  return DATE_LOCALES[locale as keyof typeof DATE_LOCALES] ?? enUS;
}

/** "auto" follows the app's language. */
export const TIME_FORMATS = ["auto", "12", "24"] as const;
export type TimeFormat = (typeof TIME_FORMATS)[number];

/** Day before month (23 Oct) or month before day (Oct 23); "auto" follows the language. */
export const DATE_ORDERS = ["auto", "dmy", "mdy"] as const;
export type DateOrder = (typeof DATE_ORDERS)[number];

export type DateFormats = { time: TimeFormat; date: DateOrder };

/** A date-fns locale that also remembers the date order chosen in Settings. */
export type AppDateLocale = DateLocale & { dateOrder?: DateOrder };

type Width = "full" | "long" | "medium" | "short";

/** A date-fns formatLong function over fixed patterns ("any" reads as "full"). */
function longFn(patterns: Record<Width, string>): FormatLongFn {
  return (options) => patterns[options?.width && options.width !== "any" ? options.width : "full"];
}

const TIME: Record<"12" | "24", Record<Width, string>> = {
  "12": { full: "h:mm:ss a zzzz", long: "h:mm:ss a z", medium: "h:mm:ss a", short: "h:mm a" },
  "24": { full: "HH:mm:ss zzzz", long: "HH:mm:ss z", medium: "HH:mm:ss", short: "HH:mm" },
};

const DATE: Record<"dmy" | "mdy", Record<Width, string>> = {
  dmy: { full: "EEEE, d MMMM y", long: "d MMMM y", medium: "d MMM y", short: "dd/MM/y" },
  mdy: { full: "EEEE, MMMM d, y", long: "MMMM d, y", medium: "MMM d, y", short: "MM/dd/y" },
};

export function isTimeFormat(value: unknown): value is TimeFormat {
  return (TIME_FORMATS as readonly unknown[]).includes(value);
}

export function isDateOrder(value: unknown): value is DateOrder {
  return (DATE_ORDERS as readonly unknown[]).includes(value);
}

/**
 * `base` with the time (12/24 h) and date order from Settings, so every
 * `format(…, "p" | "PP" …)` follows them. Spanish already writes the day
 * first, so "dmy" keeps its own long forms ("23 de octubre de 2026").
 */
export function withDateFormats(base: DateLocale, formats: DateFormats): AppDateLocale {
  if (formats.time === "auto" && formats.date === "auto") return base;
  const formatLong = base.formatLong!;
  const dayFirstAlready = base.code?.startsWith("es") ?? false;
  const datePatterns =
    formats.date === "auto" || (formats.date === "dmy" && dayFirstAlready)
      ? null
      : DATE[formats.date];
  const timePatterns = formats.time === "auto" ? null : TIME[formats.time];

  return {
    ...base,
    dateOrder: formats.date,
    formatLong: {
      ...formatLong,
      date: datePatterns ? longFn(datePatterns) : formatLong.date,
      time: timePatterns ? longFn(timePatterns) : formatLong.time,
    },
  };
}

/** Day-and-month patterns in the order chosen in Settings (day first unless "mdy"). */
const PATTERNS = {
  /** 23 Oct · Oct 23 */
  dayMonth: ["d MMM", "MMM d"],
  /** Fri 23 Oct · Fri, Oct 23 */
  weekdayDayMonth: ["EEE d MMM", "EEE, MMM d"],
  /** Friday 23 October · Friday, October 23 */
  longWeekdayDayMonth: ["EEEE d MMMM", "EEEE, MMMM d"],
  /** Fri 23 Oct, 8:00 · Fri, Oct 23, 8:00 AM */
  weekdayDayMonthTime: ["EEE d MMM, p", "EEE, MMM d, p"],
} as const;

export function datePattern(locale: DateLocale | undefined, kind: keyof typeof PATTERNS) {
  return PATTERNS[kind][(locale as AppDateLocale | undefined)?.dateOrder === "mdy" ? 1 : 0];
}
