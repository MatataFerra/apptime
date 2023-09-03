import { match as matchLocale } from "@formatjs/intl-localematcher";
import Negotiator from "negotiator";
import { headers } from "next/headers";
import { NextRequest } from "next/server";

import { Locale, PathNames } from "@/types";

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

  getLocale(request: NextRequest): Locale | undefined {
    // Negotiator expects plain object so we need to transform headers
    const negotiatorHeaders: Record<string, string> = {};
    request.headers.forEach((value, key) => (negotiatorHeaders[key] = value));

    // Use negotiator and intl-localematcher to get best locale
    let languages = new Negotiator({ headers: negotiatorHeaders }).languages(this.locales);

    const locale = matchLocale(languages, this.locales, this.defaultLocale) as Locale;

    return locale;
  }

  static getHeaders() {
    const listHeaders = new Headers(headers());
    return listHeaders;
  }

  static getLocaleFromHeaders(defaultLocale: Locale) {
    const listHeaders = i18n.getHeaders();
    // Negotiator expects plain object so we need to transform headers
    const negotiatorHeaders: Record<string, string> = {};
    Object.entries(listHeaders).forEach(([key, value]) => (negotiatorHeaders[key] = value));

    // Use negotiator and intl-localematcher to get best locale
    let languages = new Negotiator({ headers: negotiatorHeaders }).languages([
      ...SUPPORTED_LOCALES,
    ]);

    const locale = matchLocale(languages, [...SUPPORTED_LOCALES], defaultLocale);

    return locale;
  }

  static isMissingLocale(pathname: string): boolean {
    return SUPPORTED_LOCALES.every(
      (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
    );
  }

  static parsePathname(pathname: string, locale: Locale) {
    const regex = new RegExp(`^/(${locale})`);
    const endpoint = pathname.replace(regex, "");
    return `/${locale}${endpoint}`;
  }

  static parseRoutes(routes: PathNames[], locale: Locale) {
    // TODO checkear que itere portodos los locale
    for (const route of routes) {
      return i18n.parsePathname(route, locale);
    }
  }

  static isRouteSupported(route: string, pathname: string) {
    // first remove the locale from the pathname
    const pathnameWithoutLocale = pathname.replace(/^\/(en|es)/, "");
    const path = pathnameWithoutLocale === "" ? "/" : pathnameWithoutLocale;

    return route === path;
  }
}

export default i18n;
