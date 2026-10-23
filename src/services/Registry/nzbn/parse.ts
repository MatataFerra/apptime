import { z } from "zod";

import { present, tidyName } from "../text";
import type { BusinessDetails, BusinessMatch, RegistryResult } from "../types";

/*
  New Zealand Business Number register (api.business.govt.nz, NZBN v5).
  The schema is only published behind the developer portal, so everything
  here is optional and read defensively; see the tests for the shape used.
*/

/** "94 2904 1234 567" -> "9429041234567"; null if it isn't 13 digits. */
export function nzbnDigits(value: string) {
  const digits = value.replace(/[\s-]/g, "");
  return /^\d{13}$/.test(digits) ? digits : null;
}

/** NZBNs are GS1 numbers starting 94, with a GS1 check digit at the end. */
export function isValidNzbn(value: string) {
  const digits = nzbnDigits(value);
  if (!digits || !digits.startsWith("94")) return false;
  const sum = digits
    .slice(0, 12)
    .split("")
    .reduce((acc, d, i) => acc + Number(d) * (i % 2 === 0 ? 1 : 3), 0);
  return (10 - (sum % 10)) % 10 === Number(digits[12]);
}

const text = z.string().nullish();

const TradingName = z.object({ name: text, endDate: text }).passthrough();

const Address = z
  .object({
    addressType: text,
    address1: text,
    address2: text,
    address3: text,
    address4: text,
    postCode: text,
    countryCode: text,
    endDate: text,
  })
  .passthrough();

const EntitySchema = z
  .object({
    nzbn: text,
    entityName: text,
    entityStatusDescription: text,
    entityTypeDescription: text,
    registrationDate: text,
    tradingNames: z.array(TradingName).nullish(),
    // Either a plain list or { addressList: [...] }, depending on the version.
    addresses: z
      .union([
        z.array(Address),
        z.object({ addressList: z.array(Address).nullish() }).passthrough(),
      ])
      .nullish(),
    phoneNumbers: z
      .array(
        z
          .object({
            phoneCountryCode: text,
            phoneAreaCode: text,
            phoneNumber: text,
          })
          .passthrough()
      )
      .nullish(),
    emailAddresses: z.array(z.object({ emailAddress: text }).passthrough()).nullish(),
    industryClassifications: z
      .array(z.object({ classificationDescription: text }).passthrough())
      .nullish(),
    gstNumbers: z.array(z.object({ gstNumber: text }).passthrough()).nullish(),
  })
  .passthrough();

// Where people actually work first; postal last.
const ADDRESS_ORDER = ["OFFICE", "PHYSICAL", "DELIVERY", "REGISTERED", "SERVICE", "POSTAL"];

function pickAddress(addresses: z.infer<typeof EntitySchema>["addresses"]) {
  const list = (Array.isArray(addresses) ? addresses : (addresses?.addressList ?? [])).filter(
    (a) => !a.endDate
  );
  function rank(type?: string | null) {
    const i = ADDRESS_ORDER.indexOf((type ?? "").toUpperCase());
    return i === -1 ? ADDRESS_ORDER.length : i;
  }
  return [...list].sort((a, b) => rank(a.addressType) - rank(b.addressType))[0];
}

/** "64", "06", "8781234" -> "+64 6 878 1234". */
function phone(p: {
  phoneCountryCode?: string | null;
  phoneAreaCode?: string | null;
  phoneNumber?: string | null;
}) {
  const number = present(p.phoneNumber);
  if (!number) return undefined;
  const local = number.replace(/\D/g, "");
  const grouped = local.length === 7 ? `${local.slice(0, 3)} ${local.slice(3)}` : number;
  const area = present(p.phoneAreaCode)?.replace(/\D/g, "");
  const cc = present(p.phoneCountryCode)?.replace(/\D/g, "");
  if (cc) return [`+${cc}`, area?.replace(/^0/, ""), grouped].filter(Boolean).join(" ");
  return [area, grouped].filter(Boolean).join(" ");
}

function country(code?: string | null) {
  const c = present(code)?.toUpperCase();
  if (!c || c === "NZ" || c === "NZL") return "New Zealand";
  return c;
}

export function parseNzbnEntity(raw: unknown): RegistryResult<BusinessDetails> {
  const parsed = EntitySchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "Unexpected answer from the NZBN register" };
  const e = parsed.data;
  const nzbn = present(e.nzbn);
  const entityName = present(e.entityName);
  if (!nzbn || !entityName) return { ok: false, error: "No business found with that NZBN" };

  const legalName = tidyName(entityName);
  const trading = (e.tradingNames ?? [])
    .filter((t) => !t.endDate)
    .map((t) => present(t.name))
    .filter((n): n is string => !!n)
    .map(tidyName);
  const address = pickAddress(e.addresses);
  const status = present(e.entityStatusDescription);
  const gst = present(e.gstNumbers?.[0]?.gstNumber);

  return {
    ok: true,
    data: {
      registry: "nzbn",
      id: nzbn,
      active: status
        ? /registered|active/i.test(status) && !/removed|closed|inactive|struck/i.test(status)
        : null,
      status,
      statusSince: null,
      legalName,
      names: [...new Set([...trading, legalName])],
      fields: {
        taxId: nzbn,
        address: present(address?.address1) ?? undefined,
        city: present(address?.address3) ?? present(address?.address2) ?? undefined,
        postcode: present(address?.postCode) ?? undefined,
        country: country(address?.countryCode),
        contactEmail: present(e.emailAddresses?.[0]?.emailAddress) ?? undefined,
        contactPhone: e.phoneNumbers?.[0] ? phone(e.phoneNumbers[0]) : undefined,
        industry: present(e.industryClassifications?.[0]?.classificationDescription) ?? undefined,
      },
      facts: [
        ...(present(e.entityTypeDescription)
          ? [{ label: "Type", value: present(e.entityTypeDescription) as string }]
          : []),
        ...(present(e.registrationDate)
          ? [{ label: "Registered", value: (present(e.registrationDate) as string).slice(0, 10) }]
          : []),
        ...(gst ? [{ label: "GST no.", value: gst }] : []),
      ],
      note: address ? null : "The register has no address for it: add it yourself.",
    },
  };
}

const SearchSchema = z
  .object({
    items: z
      .array(
        z
          .object({
            nzbn: text,
            entityName: text,
            entityStatusDescription: text,
            entityTypeDescription: text,
            tradingNames: z.array(TradingName).nullish(),
          })
          .passthrough()
      )
      .nullish(),
  })
  .passthrough();

export function parseNzbnSearch(raw: unknown, max = 8): RegistryResult<BusinessMatch[]> {
  const parsed = SearchSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "Unexpected answer from the NZBN register" };

  const matches: BusinessMatch[] = [];
  for (const item of parsed.data.items ?? []) {
    const nzbn = present(item.nzbn);
    const name = present(item.entityName);
    if (!nzbn || !name) continue;
    const trading = present(item.tradingNames?.find((t) => !t.endDate)?.name);
    matches.push({
      id: nzbn,
      name: tidyName(trading ?? name),
      detail:
        [
          trading ? tidyName(name) : null,
          present(item.entityTypeDescription),
          present(item.entityStatusDescription),
        ]
          .filter(Boolean)
          .join(" · ") || null,
    });
    if (matches.length === max) break;
  }
  return { ok: true, data: matches };
}
