import "server-only";

import {
  abnDigits,
  abnMatchesToBusiness,
  abnToBusiness,
  isValidAbn,
  parseAbnDetails,
  parseMatchingNames,
  unwrapJsonp,
} from "./abr/parse";
import { isValidNzbn, nzbnDigits, parseNzbnEntity, parseNzbnSearch } from "./nzbn/parse";
import type { BusinessDetails, BusinessMatch, RegistryId, RegistryResult } from "./types";
import { parseVies, splitVat } from "./vies/parse";

/** What the user typed, read as a number for that register or as a name. */
type Query =
  | { kind: "id"; value: string }
  | { kind: "name"; value: string }
  | { kind: "invalid"; error: string };

type Provider = {
  /** Has what it needs (keys) to run. */
  configured: () => boolean;
  read: (query: string) => Query;
  lookup: (id: string) => Promise<RegistryResult<BusinessDetails>>;
  search?: (name: string) => Promise<RegistryResult<BusinessMatch[]>>;
};

const TIMEOUT = 8000;
// Not cached: the time shown as "searched at" has to be when the data was fetched.
const CACHE = { cache: "no-store" as const };

async function getJson(url: string, headers?: Record<string, string>) {
  const response = await fetch(url, { ...CACHE, headers, signal: AbortSignal.timeout(TIMEOUT) });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`${new URL(url).host} ${response.status}`);
  return response.json();
}

/* ---------------------------- Australia: ABR ---------------------------- */

const ABR = "https://abr.business.gov.au/json";

async function abrCall(path: string, params: Record<string, string>) {
  const query = new URLSearchParams({ ...params, callback: "c", guid: process.env.ABR_GUID ?? "" });
  const response = await fetch(`${ABR}/${path}?${query}`, {
    ...CACHE,
    signal: AbortSignal.timeout(TIMEOUT),
  });
  if (!response.ok) throw new Error(`ABN Lookup ${response.status}`);
  return unwrapJsonp(await response.text());
}

const abr: Provider = {
  configured: () => !!process.env.ABR_GUID,
  read(query) {
    const digits = abnDigits(query);
    if (!digits) return { kind: "name", value: query };
    return isValidAbn(digits)
      ? { kind: "id", value: digits }
      : { kind: "invalid", error: "That ABN isn't valid: check the digits" };
  },
  async lookup(id) {
    const result = parseAbnDetails(await abrCall("AbnDetails.aspx", { abn: id }));
    return result.ok ? { ok: true, data: abnToBusiness(result.data) } : result;
  },
  async search(name) {
    const result = parseMatchingNames(
      await abrCall("MatchingNames.aspx", { name, maxResults: "20" })
    );
    return result.ok ? { ok: true, data: abnMatchesToBusiness(result.data) } : result;
  },
};

/* ------------------------- New Zealand: NZBN v5 ------------------------- */

const NZBN = "https://api.business.govt.nz/gateway/nzbn/v5";

function nzbnHeaders() {
  // MBIE's gateway (Azure API Management) takes the portal's subscription key here.
  return {
    "Ocp-Apim-Subscription-Key": process.env.NZBN_API_KEY ?? "",
    Accept: "application/json",
  };
}

const nzbn: Provider = {
  configured: () => !!process.env.NZBN_API_KEY,
  read(query) {
    const digits = nzbnDigits(query);
    if (!digits) return { kind: "name", value: query };
    return isValidNzbn(digits)
      ? { kind: "id", value: digits }
      : { kind: "invalid", error: "That NZBN isn't valid: check the digits" };
  },
  async lookup(id) {
    const raw = await getJson(`${NZBN}/entities/${id}`, nzbnHeaders());
    return raw ? parseNzbnEntity(raw) : { ok: false, error: "No business found with that NZBN" };
  },
  async search(name) {
    const query = new URLSearchParams({ "search-term": name, "page-size": "20" });
    return parseNzbnSearch(await getJson(`${NZBN}/entities?${query}`, nzbnHeaders()));
  },
};

/* --------------------------- European Union: VIES --------------------------- */

const VIES = "https://ec.europa.eu/taxation_customs/vies/rest-api";

const vies: Provider = {
  configured: () => true,
  read(query) {
    const vat = splitVat(query);
    if (vat) return { kind: "id", value: `${vat.country}${vat.number}` };
    return {
      kind: "invalid",
      error: "Type the VAT number with its country code, e.g. DE123456789",
    };
  },
  async lookup(id) {
    const vat = splitVat(id);
    if (!vat) return { ok: false, error: "Not a VAT number" };
    return parseVies(await getJson(`${VIES}/ms/${vat.country}/vat/${vat.number}`), vat);
  },
};

const PROVIDERS: Record<RegistryId, Provider> = { abr, nzbn, vies };

export type LookupOutcome =
  | { ok: true; kind: "details"; details: BusinessDetails; searchedAt: string }
  | { ok: true; kind: "matches"; matches: BusinessMatch[] }
  | { ok: false; error: string };

/** Reads the query for that register: nothing to call when it's a typo. */
export function readQuery(registry: RegistryId, query: string): Query | null {
  const provider = PROVIDERS[registry];
  if (!provider.configured()) return null;
  const read = provider.read(query);
  if (read.kind === "name" && !provider.search) {
    return { kind: "invalid", error: "This register can only be searched by number" };
  }
  return read;
}

/** Calls the register for an already-read query. */
export async function runQuery(
  registry: RegistryId,
  query: Exclude<Query, { kind: "invalid" }>
): Promise<LookupOutcome> {
  const provider = PROVIDERS[registry];
  if (query.kind === "id") {
    const result = await provider.lookup(query.value);
    return result.ok
      ? { ok: true, kind: "details", details: result.data, searchedAt: new Date().toISOString() }
      : result;
  }
  const result = await provider.search!(query.value);
  return result.ok ? { ok: true, kind: "matches", matches: result.data } : result;
}
