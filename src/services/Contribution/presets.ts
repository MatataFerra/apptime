/**
 * Contributions that come with the app: pay some countries add on top of
 * the hourly or piece rate, often holiday pay paid in advance instead of
 * as paid leave. Rates are the usual legal minimums; the user can still
 * type another rate. Names and hints live in messages under
 * `contribution_presets.<id>`.
 */
export const CONTRIBUTION_PRESETS = [
  /** Holidays Act 2003: casual and fixed-term work can be paid 8% "pay as you go". */
  { id: "nz_holiday_pay", country: "NZ", value: 8 },
  /** Fair Work: most awards pay casuals a 25% loading instead of leave. */
  { id: "au_casual_loading", country: "AU", value: 25 },
  /** Most provinces: 4% vacation pay (more after years of service). */
  { id: "ca_vacation_pay", country: "CA", value: 4 },
  /** Rolled-up holiday pay for irregular-hours and part-year workers. */
  { id: "uk_rolled_up_holiday", country: "GB", value: 12.07 },
  /** Vakantiegeld: at least 8% of the gross wage. */
  { id: "nl_holiday_allowance", country: "NL", value: 8 },
  /** Indemnité compensatrice de congés payés at the end of a CDD. */
  { id: "fr_paid_leave", country: "FR", value: 10 },
] as const;

export type ContributionPreset = (typeof CONTRIBUTION_PRESETS)[number];
export type ContributionPresetId = ContributionPreset["id"];
