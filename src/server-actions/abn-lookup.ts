"use server";

import { z } from "zod";

import { abrConfigured, lookupAbn, searchAbnByName } from "@/services/Abr";
import type { AbnDetails, AbnMatch } from "@/services/Abr/parse";
import { abnDigits, isValidAbn } from "@/services/Abr/parse";
import { consumeRateLimit } from "@/services/RateLimit";

import { getSession } from "@/utils/auth/session";

/** Plenty for filling in a few employers; stops the action being used as a proxy. */
const PER_USER = { window: 10 * 60, max: 30 };

const QuerySchema = z.string().trim().min(3, "Type at least 3 characters").max(120);

export type AbnLookupResult =
  | { ok: true; kind: "details"; details: AbnDetails }
  | { ok: true; kind: "matches"; matches: AbnMatch[] }
  | { ok: false; error: string };

/**
 * Looks a business up on the Australian Business Register: an ABN gives
 * its details, anything else is searched as a name.
 */
export async function onLookupAbn(query: string): Promise<AbnLookupResult> {
  const userId = (await getSession())?.user.id;
  if (!userId) return { ok: false, error: "Not signed in" };
  if (!abrConfigured()) return { ok: false, error: "The ABN Lookup isn't available right now" };

  const parsed = QuerySchema.safeParse(query);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  const value = parsed.data;

  // Eleven digits is an ABN: check it here instead of spending a call on a typo.
  const asAbn = abnDigits(value);
  if (asAbn && !isValidAbn(asAbn)) {
    return { ok: false, error: "That ABN isn't valid: check the digits" };
  }

  if (!(await consumeRateLimit(`abn-lookup:user:${userId}`, PER_USER))) {
    return { ok: false, error: "Too many lookups, try again in a few minutes" };
  }

  try {
    if (asAbn) {
      const result = await lookupAbn(asAbn);
      return result.ok ? { ok: true, kind: "details", details: result.data } : result;
    }
    const result = await searchAbnByName(value);
    return result.ok ? { ok: true, kind: "matches", matches: result.data } : result;
  } catch (error) {
    // eslint-disable-next-line no-console -- server log for failed lookups
    console.error("[abn-lookup]", error);
    return { ok: false, error: "The ABN Lookup didn't answer, try again later" };
  }
}
