import type { RegistryId } from "./types";

/** What the form needs to know about each register (no network, client-safe). */
export type RegistryInfo = {
  id: RegistryId;
  /** Tab label. */
  label: string;
  /** What the number is called there. */
  idLabel: string;
  /** Input label and placeholder. */
  inputLabel: string;
  placeholder: string;
  /** Searching by name works; otherwise only by number. */
  byName: boolean;
  /** Credit line under the results. */
  source: string;
};

export const REGISTRIES: Record<RegistryId, RegistryInfo> = {
  abr: {
    id: "abr",
    label: "Australia",
    idLabel: "ABN",
    inputLabel: "ABN or business name",
    placeholder: "51 824 753 556 or Sunny Farms",
    byName: true,
    source: "From ABN Lookup, Australian Business Register.",
  },
  nzbn: {
    id: "nzbn",
    label: "New Zealand",
    idLabel: "NZBN",
    inputLabel: "NZBN or business name",
    placeholder: "9429041234567 or Kiwi Orchards",
    byName: true,
    source: "From the New Zealand Business Number register.",
  },
  vies: {
    id: "vies",
    label: "EU (VAT)",
    idLabel: "VAT number",
    inputLabel: "EU VAT number, with the country code",
    placeholder: "DE123456789, ES B12345678…",
    byName: false,
    source: "From VIES, the European Commission's VAT check.",
  },
};

export const REGISTRY_ORDER: RegistryId[] = ["abr", "nzbn", "vies"];

const EU = new Set([
  "austria",
  "belgium",
  "bulgaria",
  "croatia",
  "cyprus",
  "czechia",
  "czech republic",
  "denmark",
  "estonia",
  "finland",
  "france",
  "germany",
  "deutschland",
  "greece",
  "hungary",
  "ireland",
  "italy",
  "italia",
  "latvia",
  "lithuania",
  "luxembourg",
  "malta",
  "netherlands",
  "poland",
  "portugal",
  "romania",
  "slovakia",
  "slovenia",
  "spain",
  "españa",
  "sweden",
  "österreich",
  "nederland",
]);

/** The register to start on: from the form's country, else the user's currency. */
export function defaultRegistry(country?: string | null, currency?: string | null): RegistryId {
  const c = country?.trim().toLowerCase() ?? "";
  if (/^(australia|au)$/.test(c)) return "abr";
  if (/^(new zealand|nz|aotearoa)$/.test(c)) return "nzbn";
  if (EU.has(c)) return "vies";
  if (currency === "NZD") return "nzbn";
  if (currency === "EUR") return "vies";
  return "abr";
}
