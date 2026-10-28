import { useMemo } from "react";

import { enUS, es } from "date-fns/locale";
import { useLocale } from "next-intl";

import type { Locale } from "@/types";

import { withDateFormats } from "@/utils/helpers/dateFormats";

import { useDateFormatStore } from "@/store/useDateFormatStore";

export const DATE_LOCALES = { en: enUS, es } as const;

/** date-fns locale for an app locale (day and month names in `format`). */
export function dateLocaleFor(locale: Locale) {
  return DATE_LOCALES[locale] ?? enUS;
}

/**
 * date-fns locale for the current language, with the 12/24 h clock and date
 * order chosen in Settings. Pass it to every `format` that shows a date or time.
 */
function useDateLocale() {
  const locale = useLocale();
  const time = useDateFormatStore((state) => state.time);
  const date = useDateFormatStore((state) => state.date);
  return useMemo(
    () => withDateFormats(dateLocaleFor(locale as Locale), { time, date }),
    [locale, time, date]
  );
}

export default useDateLocale;
