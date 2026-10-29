/*
  Visa extensions that ask for proof of work done in the country. Each one
  is a target of days and the ways those days may be counted; a new country
  or visa is one more entry here (and its texts under "extensions.programs").
*/

/** Countries with a program, as ISO 3166-1 alpha-2 codes. */
export type VisaCountry = "AU" | "NZ";

/**
 * - days_worked: every calendar day with at least one shift (casual and
 *   piece work: only the days actually worked count).
 * - full_time_weeks: as days_worked, plus a week with `fullTimeHours` or more
 *   counts all 7 days, weekends included (full-time employment).
 */
export type CountingRule = "days_worked" | "full_time_weeks";

export type VisaProgramId = "au-88" | "au-179" | "nz-3m";

export type VisaProgram = {
  id: VisaProgramId;
  country: VisaCountry;
  /** Days of work the extension asks for. */
  targetDays: number;
  /** Rules the user can pick from; the first one is the default. */
  rules: CountingRule[];
  /** Hours in a week from which `full_time_weeks` counts the whole week. */
  fullTimeHours: number;
};

/**
 * - au-88: Australia, 2nd Working Holiday visa (417/462): 3 months (88 days)
 *   of specified work.
 * - au-179: Australia, 3rd Working Holiday visa: 6 months (179 days).
 * - nz-3m: New Zealand, Working Holiday Extension: 3 months of seasonal work
 *   in horticulture or viticulture, counted here as 90 days.
 */
export const VISA_PROGRAMS: VisaProgram[] = [
  {
    id: "au-88",
    country: "AU",
    targetDays: 88,
    rules: ["days_worked", "full_time_weeks"],
    fullTimeHours: 35,
  },
  {
    id: "au-179",
    country: "AU",
    targetDays: 179,
    rules: ["days_worked", "full_time_weeks"],
    fullTimeHours: 35,
  },
  {
    id: "nz-3m",
    country: "NZ",
    targetDays: 90,
    rules: ["days_worked", "full_time_weeks"],
    fullTimeHours: 30,
  },
];

export function programById(id: string | null | undefined): VisaProgram {
  return VISA_PROGRAMS.find((program) => program.id === id) ?? VISA_PROGRAMS[0];
}

/** Days without work, in a row, from which a break shows up in the report. */
export const GAP_MIN_DAYS = 22;
