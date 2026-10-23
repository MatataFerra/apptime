import { match as matchLocale } from "@formatjs/intl-localematcher";
import Negotiator from "negotiator";
import { NextRequest } from "next/server";

import { Locale } from "@/types";

import { SUPPORTED_LOCALES } from "@/utils/constants";
import { isLocale } from "@/utils/helpers/locale";

import { LOCALE_COOKIE } from "@/i18n/routing";

class i18n {
  defaultLocale: Locale;
  locales: Locale[];
  constructor(defaultLocale: Locale) {
    this.defaultLocale = defaultLocale;
    this.locales = [...SUPPORTED_LOCALES];
  }

  /**
   * The locale for a URL that has none: the one picked in Settings (the
   * NEXT_LOCALE cookie), else the best match for Accept-Language.
   */
  getLocale(request: NextRequest): Locale {
    const chosen = request.cookies.get(LOCALE_COOKIE)?.value;
    if (isLocale(chosen)) return chosen;

    // Negotiator expects plain object so we need to transform headers
    const negotiatorHeaders: Record<string, string> = {};
    request.headers.forEach((value, key) => (negotiatorHeaders[key] = value));

    // Use negotiator and intl-localematcher to get best locale
    const languages = new Negotiator({ headers: negotiatorHeaders }).languages(this.locales);

    return matchLocale(languages, this.locales, this.defaultLocale) as Locale;
  }
}

export default i18n;
