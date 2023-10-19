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
      expect(humanizer.humanizeDate(date, "es")).toBe("sáb, enero 2022");
    });

    test("should humanize the date using the 'distanceToNow' strategy", () => {
      const humanizer = new DateHumanizer("distanceToNow");
      const date = new Date("2022-01-01T00:00:00Z");

      expect(humanizer.humanizeDate(date, "es")).toBe("hace casi 2 años");
    });

    test("should throw an error for an invalid strategy", () => {
      // @ts-ignore
      const humanizer = new DateHumanizer("invalid");
      const date = new Date("2022-01-01T00:00:00Z");
      expect(() => humanizer.humanizeDate(date, "en")).toThrow("Estrategia no válida");
    });
  });
});
