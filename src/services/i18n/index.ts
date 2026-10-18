import { match as matchLocale } from "@formatjs/intl-localematcher";
import Negotiator from "negotiator";
import { NextRequest } from "next/server";

import { Locale } from "@/types";

import { SUPPORTED_LOCALES } from "@/utils/constants";

class i18n {
  defaultLocale: Locale;
  locales: Locale[];
  constructor(defaultLocale: Locale) {
    this.defaultLocale = defaultLocale;
    this.locales = [...SUPPORTED_LOCALES];
  }

  get supportedLocales() {
    return this.locales;
  }

  isLocaleSupported() {
    return this.locales.includes(this.defaultLocale);
  }

  get dictionaries() {
    return {
      en: () => import("../../../messages/en.json").then((mod) => mod.default),
      es: () => import("../../../messages/es.json").then((mod) => mod.default),
    };
  }

  static getDictionary(lang: Locale) {
    const I18N = new i18n(lang);
    return I18N.dictionaries[lang]() ?? I18N.dictionaries.en();
  }

  getLocale(request: NextRequest): Locale {
    // Negotiator expects plain object so we need to transform headers
    const negotiatorHeaders: Record<string, string> = {};
    request.headers.forEach((value, key) => (negotiatorHeaders[key] = value));

    // Use negotiator and intl-localematcher to get best locale
    let languages = new Negotiator({ headers: negotiatorHeaders }).languages(this.locales);

    const locale = matchLocale(languages, this.locales, this.defaultLocale) as Locale;

    return locale;
  }
}

export default i18n;
