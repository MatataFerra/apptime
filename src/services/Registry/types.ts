import type { PastedEmployer } from "@/services/Employer/paste";

/*
  A business register the employer form can look things up in. Each one
  (ABR, NZBN, VIES) turns its own answer into these shapes, so the form
  doesn't care which country it came from.
*/

export type RegistryId = "abr" | "nzbn" | "vies";

export type RegistryResult<T> = { ok: true; data: T } | { ok: false; error: string };

export type BusinessDetails = {
  registry: RegistryId;
  /** The number as it's usually printed: "51 824 753 556", "DE 123456789". */
  id: string;
  /** null: the register doesn't say. */
  active: boolean | null;
  status: string | null;
  statusSince: string | null;
  /** Legal name; null when the register keeps it private (VIES for Germany, Spain). */
  legalName: string | null;
  /** Names the user may know it by, trading names first. */
  names: string[];
  /** What goes into the form, name aside. */
  fields: PastedEmployer;
  /** Extra lines for the summary ("Type", "GST"…). */
  facts: { label: string; value: string }[];
  /** Something the user should know, e.g. what the register doesn't have. */
  note: string | null;
};

export type BusinessMatch = {
  id: string;
  name: string;
  /** "QLD 4670", "Company · Registered"… */
  detail: string | null;
};
