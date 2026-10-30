import { describe, expect, test } from "vitest";

import type { HistoryEntry } from "@/services/History";
import {
  findGaps,
  firstShiftIn,
  programById,
  type ReportEmployer,
  visaCountryOf,
  visaReport,
} from "@/services/VisaReport";

let nextId = 1;

function entry(date: string, hours: number, employerId: number | null): HistoryEntry {
  return {
    id: nextId++,
    kind: "hourly",
    shift: {} as HistoryEntry["shift"],
    date: new Date(`${date}T08:00:00`),
    name: null,
    minutes: hours * 60,
    earned: 0,
    afterTaxes: 0,
    holiday: null,
    holidayRate: 1.5,
    currency: null,
    employerId,
  };
}

const farm = { visaWorkType: "plant_animal_cultivation", postcode: "4670" };

const employers = new Map<number, ReportEmployer>([
  [1, { id: 1, name: "Berry Farm", country: "Australia", ...farm }],
  [2, { id: 2, name: "Packhouse", country: "AU", ...farm }],
  [3, { id: 3, name: "Orchard NZ", country: "New Zealand", visaWorkType: "horticulture" }],
  [4, { id: 4, name: "Somewhere", country: null }],
  // In Australia, but its work can't be checked or doesn't count.
  [5, { id: 5, name: "No details", country: "Australia" }],
  [
    6,
    {
      id: 6,
      name: "City cafe",
      country: "Australia",
      visaWorkType: "tourism_hospitality",
      postcode: "2000",
    },
  ],
  [7, { id: 7, name: "Mine", country: "Australia", visaWorkType: "mining", postcode: "6430" }],
  [
    8,
    {
      id: 8,
      name: "Labour hire",
      country: "Australia",
      visaWorkType: "plant_animal_cultivation",
      postcode: "4000",
      workPostcode: "4670",
    },
  ],
]);

const au88 = programById("au-88");
const range = { from: new Date("2026-01-01T00:00:00"), to: new Date("2026-03-31T00:00:00") };

describe("visaCountryOf", () => {
  test("reads names, codes and spellings", () => {
    expect(visaCountryOf("Australia")).toBe("AU");
    expect(visaCountryOf(" aus ")).toBe("AU");
    expect(visaCountryOf("Nueva Zelanda")).toBe("NZ");
    expect(visaCountryOf("N.Z.")).toBe("NZ");
    expect(visaCountryOf("Germany")).toBe("other");
    expect(visaCountryOf("")).toBeNull();
    expect(visaCountryOf(null)).toBeNull();
  });
});

describe("visaReport", () => {
  test("counts each calendar day once, even with two jobs that day", () => {
    const report = visaReport(
      [entry("2026-01-05", 5, 1), entry("2026-01-05", 4, 2), entry("2026-01-06", 8, 1)],
      employers,
      { program: au88, ...range }
    );
    expect(report.totalDays).toBe(2);
    expect(report.confirmedDays).toBe(2);
    expect(report.remainingDays).toBe(86);
    expect(report.minutes).toBe(17 * 60);
  });

  test("leaves out other countries and shifts outside the period", () => {
    const report = visaReport(
      [entry("2026-01-05", 8, 1), entry("2026-01-06", 8, 3), entry("2026-04-02", 8, 1)],
      employers,
      { program: au88, ...range }
    );
    expect(report.totalDays).toBe(1);
    expect(report.excludedShifts).toBe(1);
  });

  test("shifts without employer or country inside the period are assumed", () => {
    const report = visaReport(
      [entry("2026-01-05", 8, 1), entry("2026-01-06", 8, null), entry("2026-01-07", 8, 4)],
      employers,
      { program: au88, ...range }
    );
    expect(report.totalDays).toBe(3);
    expect(report.confirmedDays).toBe(1);
    expect(report.assumedDays).toBe(2);
    expect(report.days.map((d) => d.status)).toEqual(["confirmed", "assumed", "assumed"]);
    expect(report.employers.map((b) => [b.employerId, b.status, b.reason])).toEqual([
      [1, "confirmed", null],
      [null, "assumed", "no_employer"],
      [4, "assumed", "no_country"],
    ]);
  });

  test("a day with a confirmed and an assumed shift is confirmed", () => {
    const report = visaReport(
      [entry("2026-01-05", 4, null), entry("2026-01-05", 4, 1)],
      employers,
      { program: au88, ...range }
    );
    expect(report.days[0].status).toBe("confirmed");
    expect(report.assumedDays).toBe(0);
  });

  test("a deleted employer counts as no employer", () => {
    const report = visaReport([entry("2026-01-05", 8, 99)], employers, { program: au88, ...range });
    expect(report.employers[0]).toMatchObject({ employerId: null, reason: "no_employer" });
  });

  test("full-time weeks count all 7 days", () => {
    // Monday 5 Jan to Friday 9 Jan 2026, 7 h a day = 35 h.
    const week = ["05", "06", "07", "08", "09"].map((d) => entry(`2026-01-${d}`, 7, 1));
    const worked = visaReport(week, employers, { program: au88, ...range });
    expect(worked.totalDays).toBe(5);

    const fullTime = visaReport(week, employers, {
      program: au88,
      rule: "full_time_weeks",
      ...range,
    });
    expect(fullTime.totalDays).toBe(7);
    expect(fullTime.days.filter((d) => d.filled).map((d) => d.key)).toEqual([
      "2026-01-10",
      "2026-01-11",
    ]);
    expect(fullTime.days.every((d) => d.status === "confirmed")).toBe(true);
  });

  test("a full-time week reached only with assumed hours adds assumed days", () => {
    const week = [
      ...["05", "06", "07"].map((d) => entry(`2026-01-${d}`, 7, 1)),
      ...["08", "09"].map((d) => entry(`2026-01-${d}`, 7, null)),
    ];
    const report = visaReport(week, employers, {
      program: au88,
      rule: "full_time_weeks",
      ...range,
    });
    expect(report.totalDays).toBe(7);
    expect(report.confirmedDays).toBe(3);
    expect(report.assumedDays).toBe(4);
  });

  test("a full-time week doesn't count days outside the period", () => {
    const week = ["05", "06", "07", "08", "09"].map((d) => entry(`2026-01-${d}`, 7, 1));
    const report = visaReport(week, employers, {
      program: au88,
      rule: "full_time_weeks",
      from: range.from,
      to: new Date("2026-01-10T00:00:00"),
    });
    expect(report.totalDays).toBe(6);
  });

  test("lists gaps longer than three weeks", () => {
    const report = visaReport(
      [
        entry("2026-01-05", 8, 1),
        entry("2026-01-27", 8, 1), // 21 days without work: not a gap
        entry("2026-02-19", 8, 2), // 22 days: a gap
      ],
      employers,
      { program: au88, ...range }
    );
    expect(report.gaps).toHaveLength(1);
    expect(report.gaps[0].days).toBe(22);
    expect(report.gaps[0].from).toEqual(new Date("2026-01-28T00:00:00"));
    expect(report.gaps[0].to).toEqual(new Date("2026-02-18T00:00:00"));
  });
});

describe("findGaps", () => {
  test("nothing with fewer than two days", () => {
    expect(findGaps([])).toEqual([]);
    expect(findGaps([{ date: new Date("2026-01-01T00:00:00") }])).toEqual([]);
  });
});

describe("firstShiftIn", () => {
  test("the first shift for an employer in that country", () => {
    const fallback = new Date("2026-06-01T00:00:00");
    const entries = [
      entry("2026-02-01", 8, 3),
      entry("2026-03-01", 8, 1),
      entry("2026-01-01", 8, null),
    ];
    expect(firstShiftIn(entries, employers, "AU", fallback)).toEqual(
      new Date("2026-03-01T00:00:00")
    );
    expect(firstShiftIn([], employers, "AU", fallback)).toEqual(fallback);
  });
});

describe("eligibility in the report", () => {
  test("work that doesn't count is left out of the total, in its own status", () => {
    const report = visaReport(
      [entry("2026-01-05", 8, 1), entry("2026-01-06", 8, 6), entry("2026-01-07", 8, 5)],
      employers,
      { program: au88, ...range }
    );
    expect(report.totalDays).toBe(2);
    expect(report.notEligibleDays).toBe(1);
    expect(report.days.map((d) => [d.key, d.status])).toEqual([
      ["2026-01-05", "confirmed"],
      ["2026-01-06", "not_eligible"],
      ["2026-01-07", "assumed"],
    ]);
    expect(report.employers.map((b) => [b.employerId, b.status, b.reason])).toEqual([
      [1, "confirmed", null],
      [5, "assumed", "no_work_type"],
      [6, "not_eligible", "area"],
    ]);
    expect(report.minutes).toBe(16 * 60);
  });

  test("mining counts on a 417 but not on a 462", () => {
    const shifts = [entry("2026-01-05", 8, 7)];
    expect(visaReport(shifts, employers, { program: au88, ...range }).totalDays).toBe(1);
    const r462 = visaReport(shifts, employers, { program: au88, subclass: "462", ...range });
    expect(r462.totalDays).toBe(0);
    expect(r462.employers[0]).toMatchObject({ status: "not_eligible", reason: "work_type" });
  });

  test("the work postcode wins over the address one", () => {
    const report = visaReport([entry("2026-01-05", 8, 8)], employers, { program: au88, ...range });
    expect(report.confirmedDays).toBe(1);
  });

  test("a day with work that counts and work that doesn't is counted", () => {
    const report = visaReport([entry("2026-01-05", 4, 6), entry("2026-01-05", 4, 1)], employers, {
      program: au88,
      ...range,
    });
    expect(report.days[0].status).toBe("confirmed");
    expect(report.notEligibleDays).toBe(0);
  });

  test("hours that don't count don't make a full-time week", () => {
    const week = [
      ...["05", "06", "07"].map((d) => entry(`2026-01-${d}`, 7, 1)),
      ...["08", "09"].map((d) => entry(`2026-01-${d}`, 7, 6)),
    ];
    const report = visaReport(week, employers, {
      program: au88,
      rule: "full_time_weeks",
      ...range,
    });
    expect(report.totalDays).toBe(3);
    expect(report.notEligibleDays).toBe(2);
  });
});
