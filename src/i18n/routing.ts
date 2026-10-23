import { defineRouting } from "next-intl/routing";

import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from "@/utils/constants";

/**
 * Locales and how they show in the URL (always as the first segment:
 * /en/track, /es/track). The proxy (src/proxy.ts) adds the prefix when a
 * URL has none, preferring the NEXT_LOCALE cookie over Accept-Language.
 */
export const routing = defineRouting({
  locales: SUPPORTED_LOCALES,
  defaultLocale: DEFAULT_LOCALE,
  localePrefix: "always",
  // Written by the navigation helpers when the language changes (Settings),
  // so the choice survives links and visits without a locale in the URL.
  localeCookie: { name: "NEXT_LOCALE", maxAge: 60 * 60 * 24 * 365 },
});

export const LOCALE_COOKIE = "NEXT_LOCALE";
