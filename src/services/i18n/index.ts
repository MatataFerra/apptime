import { SUPPORTED_LOCALES } from "@/utils/constants";
import Negotiator from "negotiator";
import { NextRequest } from "next/server";
import { match as matchLocale } from "@formatjs/intl-localematcher";
import { Locale } from "@/types";

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
      en: () => import("#/i18n/en/en.json").then((module) => module.default),
      es: () => import("#/i18n/es/es.json").then((module) => module.default),
    };
  }

  static getDictionary(lang: Locale) {
    const I18N = new i18n(lang);
    return I18N.dictionaries[lang]() ?? I18N.dictionaries.en();
  }

  getLocale(request: NextRequest): Locale | undefined {
    // Negotiator expects plain object so we need to transform headers
    const negotiatorHeaders: Record<string, string> = {};
    request.headers.forEach((value, key) => (negotiatorHeaders[key] = value));

    // Use negotiator and intl-localematcher to get best locale
    let languages = new Negotiator({ headers: negotiatorHeaders }).languages(this.locales);

    const locale = matchLocale(languages, this.locales, this.defaultLocale) as Locale;

    return locale;
  }

  static isMissingLocale(pathname: string): boolean {
    return SUPPORTED_LOCALES.every(
      (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
    );
  }

  static parsePathname(pathname: string, locale: Locale = "en") {
    const regex = new RegExp(`^/(${locale})`);
    const t = pathname.replace(regex, "");
    return `/${locale}${t}`;
  }
}

export default i18n;
