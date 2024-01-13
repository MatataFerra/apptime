import { format, formatDistanceToNow } from "date-fns";
import { enUS, es, Locale } from "date-fns/locale";

import type { DateHumanizerStrategy, Locale as possibleLocale } from "@/types";

type DateHumanizerStrategies = {
  [x: string]: (date: Date, locale?: possibleLocale, dateFormat?: string) => string;
};

export default class DateHumanizer {
  strategy: DateHumanizerStrategy;
  strategies: DateHumanizerStrategies;
  locale: {
    es: Locale;
    en: Locale;
  };
  constructor(strategy: DateHumanizerStrategy) {
    this.strategy = strategy;
    this.locale = {
      es: es,
      en: enUS,
    };
    this.strategies = {
      today: (date: Date, locale?: possibleLocale, dateFormat: string = "eee do, MMMM yyyy") =>
        format(date, dateFormat, { locale: this.locale[locale || "en"] }),
      distanceToNow: (date: Date, locale?: possibleLocale, format?: string) =>
        formatDistanceToNow(date, { addSuffix: true, locale: this.locale[locale || "en"] }),
    };
  }

  setStrategy(strategy: DateHumanizerStrategy) {
    if (!this.strategies[strategy]) {
      throw new Error("Estrategia no válida");
    }
    this.strategy = strategy;
  }

  humanizeDate(date: Date, locale?: possibleLocale, format: string = "eee do, MMMM yyyy"): string {
    if (!this.strategies[this.strategy]) {
      throw new Error("Estrategia no válida");
    }
    return this.strategies[this.strategy](date, locale, format);
  }
}
