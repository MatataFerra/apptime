import type { Locale } from "@/types";

import { SUPPORTED_LOCALES } from "@/utils/constants";

/** Narrows a route segment (always a string) to one of the app's locales. */
export function isLocale(value: string | undefined | null): value is Locale {
  return SUPPORTED_LOCALES.includes(value as Locale);
}
