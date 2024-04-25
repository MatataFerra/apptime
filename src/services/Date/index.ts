import { format, formatDistanceToNow, isValid } from "date-fns";
import { enUS, es, Locale } from "date-fns/locale";

import type { DateHumanizerStrategy, Locale as possibleLocale } from "@/types";

type Options = {
  locale?: possibleLocale;
  dateFormat?: string;
  time?: string;
};

type DateHumanizerStrategies = {
  [x: string]: (date: Date, options: Options) => string;
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
      today: (date: Date, { locale, dateFormat = "eee do, MMMM yyyy" }) =>
        format(date, dateFormat, { locale: this.locale[locale || "en"] }),
      distanceToNow: (date: Date, { locale }) =>
        formatDistanceToNow(date, { addSuffix: true, locale: this.locale[locale || "en"] }),
      formatAndAddTime: (date: Date, { time }) => this.formatAndAddTime({ date, time }),
      formatDate: (date: Date) => this.formatDate(date),
      short: (date: Date, { locale, dateFormat }) => {
        if (dateFormat) {
          return this.format(date, dateFormat, locale);
        }

        return new Date(date).toLocaleDateString(locale, {
          month: "short",
          day: "numeric",
          year: "numeric",
        });
      },
      long: (date: Date, { locale }) =>
        new Date(date).toLocaleDateString(locale, {
          month: "long",
          day: "numeric",
          year: "numeric",
        }),
    };
  }

  setStrategy(strategy: DateHumanizerStrategy) {
    if (!this.strategies[strategy]) {
      throw new Error("Estrategia no válida");
    }
    this.strategy = strategy;
  }

  humanizeDate(date: Date, options?: Options) {
    if (!this.strategies[this.strategy]) {
      throw new Error("Estrategia no válida");
    }
    return this.strategies[this.strategy](date, { ...options });
  }

  /* Private methods */
  private formatAndAddTime({ date, time }: { date: Date | undefined | null; time?: string }) {
    const dateFomated = this.formatDate(date ?? new Date());

    return this.addHoursAndMinutes(new Date(dateFomated), time ?? "").toString();
  }

  private formatDate(date = new Date()) {
    const year = date.toLocaleString("default", { year: "numeric" });
    const month = date.toLocaleString("default", {
      month: "2-digit",
    });
    const day = date.toLocaleString("default", { day: "2-digit" });

    return [year, month, day].join("-");
  }

  private addHoursAndMinutes(date: Date, time: string) {
    const [hours, minutes] = time.split(":");

    date.setHours(Number(hours));
    date.setMinutes(Number(minutes));
    return date;
  }

  private format(date: Date, dateFormat: string, locale?: "es" | "en") {
    //! DELETE Date.now()
    const validDate = isValid(date) ? date : Date.now();
    return format(validDate, dateFormat, { locale: this.locale[locale || "en"] });
  }
}
