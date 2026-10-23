import "server-only";

import {
  type AbnDetails,
  abnDigits,
  type AbnMatch,
  type AbrResult,
  parseAbnDetails,
  parseMatchingNames,
  unwrapJsonp,
} from "./parse";

const API = "https://abr.business.gov.au/json";

/** The GUID ABN Lookup emails after registering (free). Unset: lookup is off. */
export function abrConfigured() {
  return !!process.env.ABR_GUID;
}

async function call(path: string, params: Record<string, string>): Promise<unknown> {
  const query = new URLSearchParams({ ...params, callback: "c", guid: process.env.ABR_GUID ?? "" });
  const response = await fetch(`${API}/${path}?${query}`, {
    // A business's details rarely change: a day of cache saves calls.
    next: { revalidate: 60 * 60 * 24 },
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) throw new Error(`ABN Lookup ${response.status}`);
  return unwrapJsonp(await response.text());
}

/** Details for one ABN (checksum already checked by the caller). */
export async function lookupAbn(abn: string): Promise<AbrResult<AbnDetails>> {
  const digits = abnDigits(abn);
  if (!digits) return { ok: false, error: "An ABN has 11 digits" };
  return parseAbnDetails(await call("AbnDetails.aspx", { abn: digits }));
}

/** Businesses whose name matches, best first. */
export async function searchAbnByName(name: string): Promise<AbrResult<AbnMatch[]>> {
  return parseMatchingNames(
    await call("MatchingNames.aspx", { name: name.trim(), maxResults: "20" })
  );
}
