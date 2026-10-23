import { enUS, es } from "date-fns/locale";
import { useLocale } from "next-intl";

import type { Locale } from "@/types";

export const DATE_LOCALES = { en: enUS, es } as const;

/** date-fns locale for an app locale (day and month names in `format`). */
export function dateLocaleFor(locale: Locale) {
  return DATE_LOCALES[locale] ?? enUS;
}

/** date-fns locale for the current language. Pass it to every `format` that shows names. */
function useDateLocale() {
  return dateLocaleFor(useLocale());
}

export default useDateLocale;
