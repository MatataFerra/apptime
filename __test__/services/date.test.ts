import { describe, expect, test } from "vitest";

import DateHumanizer from "@/services/Date";

describe("DateHumanizer", () => {
  describe("setStrategy", () => {
    test("should set the strategy to 'today'", () => {
      const humanizer = new DateHumanizer("distanceToNow");
      humanizer.setStrategy("today");
      expect(humanizer.strategy).toBe("today");
    });

    test("should set the strategy to 'distanceToNow'", () => {
      const humanizer = new DateHumanizer("today");
      humanizer.setStrategy("distanceToNow");
      expect(humanizer.strategy).toBe("distanceToNow");
    });

    test("should set the strategy to 'formatAndAddTime'", () => {
      const humanizer = new DateHumanizer("today");
      humanizer.setStrategy("formatAndAddTime");
      expect(humanizer.strategy).toBe("formatAndAddTime");
    });

    test("should throw an error for an invalid strategy", () => {
      const humanizer = new DateHumanizer("today");
      // @ts-ignore
      expect(() => humanizer.setStrategy("invalid")).toThrow("Estrategia no válida");
    });
  });

  describe("humanizeDate", () => {
    test("should humanize the date using the 'today' strategy", () => {
      const humanizer = new DateHumanizer("today");
      const date = new Date("2022-01-01T00:00:00Z");
      expect(humanizer.humanizeDate(date, { locale: "es" })).toBe("sáb 1º, enero 2022");
    });

    test("should humanize the date using the 'distanceToNow' strategy", () => {
      const humanizer = new DateHumanizer("distanceToNow");
      const date = new Date("2022-01-01T00:00:00Z");

      expect(humanizer.humanizeDate(date, { locale: "es" })).toBe("hace alrededor de 2 años");
    });

    test("should throw an error for an invalid strategy", () => {
      // @ts-ignore
      const humanizer = new DateHumanizer("invalid");
      const date = new Date("2022-01-01T00:00:00Z");
      expect(() => humanizer.humanizeDate(date, { locale: "en" })).toThrow("Estrategia no válida");
    });

    test("should format and add time to the date using the 'formatAndAddTime' strategy", () => {
      const humanizer = new DateHumanizer("formatAndAddTime");
      const date = new Date("2022-01-01T00:00:00Z");
      expect(humanizer.humanizeDate(date, { time: "12:00" })).toBe(
        "Sat Jan 01 2022 12:00:00 GMT+1300 (hora de verano de Nueva Zelanda)"
      );
    });
  });
});
