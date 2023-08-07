import { Locale } from "#/i18n/i18n-config";
import { SUPPORTED_LOCALES } from "@/utils/constants";


class i18n {
  defaultLocale: Locale;
  locales: Locale[];
  constructor(defaultLocale: Locale) {
    this.defaultLocale = defaultLocale;
    this.locales = SUPPORTED_LOCALES;
  }

  get supportedLocales() {
    return this.locales;
  }

  isLocaleSupported() {
    return this.locales.includes(this.defaultLocale);
  }

  dictonaries() {

    return {
      en: () => import('#/i18n/en/en.json').then((module) => module.default),
  es: () => import('#/i18n/es/es.json').then((module) => module.default),
    }
  }
}

export default i18n;
