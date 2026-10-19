import { getRequestConfig } from "next-intl/server";

import type { Locale } from "@/types";

import { isLocale } from "@/utils/helpers/locale";

/**
 * Request config for next-intl's server APIs. The client components get
 * their messages from the `[locale]` layout through NextIntlClientProvider.
 */
export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale: Locale = isLocale(requested) ? requested : "en";

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
    timeZone: "UTC",
  };
});
