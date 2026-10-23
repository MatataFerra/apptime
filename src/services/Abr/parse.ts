import { z } from "zod";

/*
  Parsing for the ABN Lookup JSON services (abr.business.gov.au/json).
  No network here, so it can be tested on its own; the fetch is in ./index.ts.

  The services answer JSONP even when asked for JSON, and the shape isn't
  published as a schema, so every field is optional and read defensively.
*/

const ABN_WEIGHTS = [10, 1, 3, 5, 7, 9, 11, 13, 15, 17, 19];

/** "51 824 753 556" -> "51824753556"; null if it isn't 11 digits. */
export function abnDigits(value: string) {
  const digits = value.replace(/[\s-]/g, "");
  return /^\d{11}$/.test(digits) ? digits : null;
}

/**
 * The ABR's checksum: take 1 from the first digit, weight the digits,
 * and the sum must divide by 89. Catches typos before calling the API.
 */
export function isValidAbn(value: string) {
  const digits = abnDigits(value);
  if (!digits || digits[0] === "0") return false;
  const sum = digits
    .split("")
    .map(Number)
    .reduce((acc, digit, i) => acc + (i === 0 ? digit - 1 : digit) * ABN_WEIGHTS[i], 0);
  return sum % 89 === 0;
}

/** "51824753556" -> "51 824 753 556", the way it's printed on payslips. */
export function formatAbn(value: string) {
  const digits = abnDigits(value);
  if (!digits) return value.trim();
  return `${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5, 8)} ${digits.slice(8)}`;
}

/** `callback({...})` -> `{...}`; plain JSON passes through. Null if neither. */
export function unwrapJsonp(body: string): unknown {
  const text = body.trim();
  const inner = text.match(/^[\w$.]+\s*\(([\s\S]*)\)\s*;?$/)?.[1] ?? text;
  try {
    return JSON.parse(inner);
  } catch {
    return null;
  }
}

const text = z
  .string()
  .nullish()
  .transform((value) => value?.trim() || null);

const AbnDetailsSchema = z.object({
  Abn: text,
  AbnStatus: text,
  AbnStatusEffectiveFrom: text,
  AddressPostcode: text,
  AddressState: text,
  BusinessName: z.array(z.string()).nullish(),
  EntityName: text,
  EntityTypeName: text,
  /** Date GST registration started; empty if not registered. */
  Gst: text,
  Message: text,
});

export type AbnDetails = {
  abn: string;
  /** "Active" or "Cancelled". */
  status: string | null;
  statusSince: string | null;
  /** Legal name. */
  entityName: string;
  /** Registered business (trading) names, the ones on signs and payslips. */
  businessNames: string[];
  entityType: string | null;
  state: string | null;
  postcode: string | null;
  gstSince: string | null;
};

export type AbrResult<T> = { ok: true; data: T } | { ok: false; error: string };

/** The AbnDetails answer, or the ABR's own message when there's no match. */
export function parseAbnDetails(raw: unknown): AbrResult<AbnDetails> {
  const parsed = AbnDetailsSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "Unexpected answer from the ABN Lookup" };

  const d = parsed.data;
  if (!d.Abn || !d.EntityName) {
    return { ok: false, error: d.Message || "No business found with that ABN" };
  }

  return {
    ok: true,
    data: {
      abn: formatAbn(d.Abn),
      status: d.AbnStatus,
      statusSince: d.AbnStatusEffectiveFrom,
      entityName: d.EntityName,
      businessNames: (d.BusinessName ?? []).map((n) => n.trim()).filter(Boolean),
      entityType: d.EntityTypeName,
      state: d.AddressState,
      postcode: d.AddressPostcode,
      gstSince: d.Gst,
    },
  };
}

const MatchingNamesSchema = z.object({
  Message: text,
  Names: z
    .array(
      z.object({
        Abn: text,
        AbnStatus: text,
        IsCurrent: z.boolean().nullish(),
        Name: text,
        NameType: text,
        Postcode: text,
        State: text,
        Score: z.number().nullish(),
      })
    )
    .nullish(),
});

export type AbnMatch = {
  abn: string;
  name: string;
  /** "Entity Name", "Business Name", "Trading Name"… */
  nameType: string | null;
  state: string | null;
  postcode: string | null;
};

/** Name search results, best first, one per ABN, only names still in use. */
export function parseMatchingNames(raw: unknown, max = 8): AbrResult<AbnMatch[]> {
  const parsed = MatchingNamesSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "Unexpected answer from the ABN Lookup" };

  const names = parsed.data.Names ?? [];
  if (names.length === 0 && parsed.data.Message) {
    return { ok: false, error: parsed.data.Message };
  }

  const seen = new Set<string>();
  const matches: AbnMatch[] = [];
  for (const n of [...names].sort((a, b) => (b.Score ?? 0) - (a.Score ?? 0))) {
    const abn = n.Abn ? abnDigits(n.Abn) : null;
    if (!abn || !n.Name || n.IsCurrent === false || seen.has(abn)) continue;
    seen.add(abn);
    matches.push({
      abn: formatAbn(abn),
      name: n.Name,
      nameType: n.NameType,
      state: n.State,
      postcode: n.Postcode,
    });
    if (matches.length === max) break;
  }

  return { ok: true, data: matches };
}

const KEEP_UPPER = new Set(["ABN", "ACN", "NSW", "VIC", "QLD", "SA", "WA", "TAS", "NT", "ACT"]);
const SMALL = new Set(["and", "of", "the", "for", "in", "on", "at"]);

/**
 * "SUNNY FARMS PTY LTD" -> "Sunny Farms Pty Ltd". The register stores most
 * names in capitals; mixed-case names are left as they are.
 */
export function tidyName(name: string) {
  const trimmed = name.trim();
  if (trimmed !== trimmed.toUpperCase()) return trimmed;
  let index = 0;
  return trimmed.toLowerCase().replace(/[\p{L}\p{N}']+/gu, (word) => {
    const first = index++ === 0;
    if (KEEP_UPPER.has(word.toUpperCase())) return word.toUpperCase();
    if (!first && SMALL.has(word)) return word;
    return word.charAt(0).toUpperCase() + word.slice(1);
  });
}
