import { areasOfPostcode, type AuArea, parsePostcode } from "@/services/Visa/australia";

import type { VisaCountry } from "./programs";

/*
  Which work counts for each visa, and where. Australia: the kinds of
  specified work of LIN 22/012 (417) and LIN 22/013 (462), each with the
  areas it has to be done in. New Zealand: only horticulture and viticulture
  (planting, maintaining, harvesting or packing crops) count.
*/

export const VISA_WORK_TYPES = {
  AU: [
    "plant_animal_cultivation",
    "fishing_pearling",
    "tree_farming_felling",
    "mining",
    "construction",
    "tourism_hospitality",
    "recovery",
    "other",
  ],
  NZ: ["horticulture", "viticulture", "other"],
} as const satisfies Record<VisaCountry, readonly string[]>;

export type VisaWorkType = (typeof VISA_WORK_TYPES)[VisaCountry][number];

export const ALL_WORK_TYPES: VisaWorkType[] = [...new Set(Object.values(VISA_WORK_TYPES).flat())];

export function isVisaWorkType(value: unknown): value is VisaWorkType {
  return ALL_WORK_TYPES.includes(value as VisaWorkType);
}

/** Australian Working Holiday visa subclass. */
export type AuSubclass = "417" | "462";

type AuWorkType = (typeof VISA_WORK_TYPES)["AU"][number];

/** Areas where each kind of work counts; an empty list: it never counts for that subclass. */
const AU_AREAS: Record<AuSubclass, Record<Exclude<AuWorkType, "recovery" | "other">, AuArea[]>> = {
  "417": {
    plant_animal_cultivation: ["regional"],
    fishing_pearling: ["regional"],
    tree_farming_felling: ["regional"],
    mining: ["regional"],
    construction: ["regional"],
    tourism_hospitality: ["northern", "remote"],
  },
  "462": {
    plant_animal_cultivation: ["northern", "regional"],
    fishing_pearling: ["northern"],
    tree_farming_felling: ["northern"],
    mining: [],
    construction: ["northern", "regional"],
    tourism_hospitality: ["northern", "remote"],
  },
};

/** Areas where `type` counts for `subclass`; null for recovery and other. */
export function auAreasFor(type: VisaWorkType, subclass: AuSubclass): AuArea[] | null {
  return AU_AREAS[subclass][type as keyof (typeof AU_AREAS)["417"]] ?? null;
}

/**
 * - eligible: the work counts.
 * - not_eligible: the work doesn't count for this visa (`work_type`) or not
 *   where it's done (`area`).
 * - unknown: missing data (`no_work_type`, `no_postcode`), or something the
 *   app can't check (`recovery`: the declared areas are councils, not postcodes).
 */
export type Eligibility =
  | { status: "eligible" }
  | { status: "not_eligible"; reason: "work_type" | "area" }
  | { status: "unknown"; reason: "no_work_type" | "no_postcode" | "recovery" };

export type EligibilityEmployer = {
  visaWorkType: string | null;
  postcode: string | null;
  workPostcode: string | null;
};

/** The postcode the work is done at: the work one, else the address one. */
export function workPostcodeOf(employer: Pick<EligibilityEmployer, "postcode" | "workPostcode">) {
  return employer.workPostcode?.trim() || employer.postcode?.trim() || null;
}

/** Whether an employer's work counts for a visa of `country` (and subclass in Australia). */
export function eligibility(
  employer: EligibilityEmployer,
  country: VisaCountry,
  subclass: AuSubclass = "417"
): Eligibility {
  const type = employer.visaWorkType;
  if (!isVisaWorkType(type) || !(VISA_WORK_TYPES[country] as readonly string[]).includes(type)) {
    return { status: "unknown", reason: "no_work_type" };
  }
  if (type === "other") return { status: "not_eligible", reason: "work_type" };

  if (country === "NZ") return { status: "eligible" };

  if (type === "recovery") return { status: "unknown", reason: "recovery" };
  const needed = auAreasFor(type, subclass) ?? [];
  if (needed.length === 0) return { status: "not_eligible", reason: "work_type" };

  const postcode = workPostcodeOf(employer);
  if (parsePostcode(postcode) === null) return { status: "unknown", reason: "no_postcode" };
  const areas = areasOfPostcode(postcode);
  return needed.some((area) => areas.includes(area))
    ? { status: "eligible" }
    : { status: "not_eligible", reason: "area" };
}
