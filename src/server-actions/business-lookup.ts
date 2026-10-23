"use server";

import { z } from "zod";

import { consumeRateLimit } from "@/services/RateLimit";
import { type LookupOutcome, readQuery, runQuery } from "@/services/Registry";
import { REGISTRIES } from "@/services/Registry/registries";
import type { RegistryId } from "@/services/Registry/types";

import { getSession } from "@/utils/auth/session";

/** Plenty for filling in a few employers; stops the action being used as a proxy. */
const PER_USER = { window: 10 * 60, max: 30 };

const InputSchema = z.object({
  registry: z.enum(["abr", "nzbn", "vies"]),
  query: z.string().trim().min(3, "Type at least 3 characters").max(120),
});

/**
 * Looks a business up in a public register (ABR, NZBN, VIES): a number
 * gives its details, a name (where the register allows it) a list.
 */
export async function onLookupBusiness(
  registry: RegistryId,
  query: string
): Promise<LookupOutcome> {
  const userId = (await getSession())?.user.id;
  if (!userId) return { ok: false, error: "Not signed in" };

  const input = InputSchema.safeParse({ registry, query });
  if (!input.success) return { ok: false, error: input.error.issues[0].message };

  const read = readQuery(input.data.registry, input.data.query);
  if (!read) {
    return {
      ok: false,
      error: `The ${REGISTRIES[input.data.registry].label} lookup isn't available right now`,
    };
  }
  // A mistyped number is caught here: no call, no quota spent.
  if (read.kind === "invalid") return { ok: false, error: read.error };

  if (!(await consumeRateLimit(`business-lookup:user:${userId}`, PER_USER))) {
    return { ok: false, error: "Too many lookups, try again in a few minutes" };
  }

  try {
    return await runQuery(input.data.registry, read);
  } catch (error) {
    // eslint-disable-next-line no-console -- server log for failed lookups
    console.error("[business-lookup]", input.data.registry, error);
    return { ok: false, error: "The register didn't answer, try again later" };
  }
}
