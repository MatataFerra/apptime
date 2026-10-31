import { useMemo } from "react";

import { useLocale } from "next-intl";

import type { Locale } from "@/types";

import { DATE_LOCALES, dateLocaleFor, withDateFormats } from "@/utils/helpers/dateFormats";

import { useDateFormatStore } from "@/store/useDateFormatStore";

export { DATE_LOCALES, dateLocaleFor };

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
