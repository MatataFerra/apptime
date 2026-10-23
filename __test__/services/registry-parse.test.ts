import { describe, expect, test } from "vitest";

import { abnToBusiness, parseAbnDetails } from "@/services/Registry/abr/parse";
import { isValidNzbn, parseNzbnEntity, parseNzbnSearch } from "@/services/Registry/nzbn/parse";
import { defaultRegistry } from "@/services/Registry/registries";
import { parseVies, splitVat } from "@/services/Registry/vies/parse";

describe("ABR -> business", () => {
  test("trading names first, legal name last, Australia and state filled", () => {
    const parsed = parseAbnDetails({
      Abn: "51824753556",
      AbnStatus: "Cancelled",
      AbnStatusEffectiveFrom: "2024-01-01",
      AddressPostcode: "4670",
      AddressState: "QLD",
      BusinessName: ["SUNNY FARMS"],
      EntityName: "SUNNY HOLDINGS PTY LTD",
      Gst: "",
    });
    if (!parsed.ok) throw new Error("parse");
    expect(abnToBusiness(parsed.data)).toMatchObject({
      registry: "abr",
      id: "51 824 753 556",
      active: false,
      legalName: "Sunny Holdings Pty Ltd",
      names: ["Sunny Farms", "Sunny Holdings Pty Ltd"],
      fields: { taxId: "51 824 753 556", region: "QLD", postcode: "4670", country: "Australia" },
      facts: expect.arrayContaining([{ label: "GST", value: "Not registered" }]),
    });
  });
});

describe("NZBN", () => {
  test("checksum: GS1 check digit, starting 94", () => {
    expect(isValidNzbn("9429041234563")).toBe(true);
    expect(isValidNzbn("94 2904 1234 563")).toBe(true);
    expect(isValidNzbn("9429041234564")).toBe(false);
    expect(isValidNzbn("1234567890128")).toBe(false);
    expect(isValidNzbn("942904123456")).toBe(false);
  });

  const entity = {
    nzbn: "9429041234563",
    entityName: "KIWI ORCHARDS LIMITED",
    entityStatusDescription: "Registered",
    entityTypeDescription: "NZ Limited Company",
    registrationDate: "2015-03-02T00:00:00.000+13:00",
    tradingNames: [
      { name: "Kiwi Orchards Hawke's Bay", endDate: null },
      { name: "OLD NAME", endDate: "2019-01-01" },
    ],
    addresses: {
      addressList: [
        {
          addressType: "POSTAL",
          address1: "PO Box 12",
          address2: "Hastings",
          postCode: "4156",
          countryCode: "NZ",
        },
        {
          addressType: "REGISTERED",
          address1: "45 Orchard Road",
          address2: "Twyford",
          address3: "Hastings",
          postCode: "4175",
          countryCode: "NZ",
        },
      ],
    },
    phoneNumbers: [{ phoneCountryCode: "64", phoneAreaCode: "06", phoneNumber: "8781234" }],
    emailAddresses: [{ emailAddress: "jobs@kiwiorchards.co.nz" }],
    industryClassifications: [
      { classificationCode: "A013100", classificationDescription: "Apple and pear growing" },
    ],
    gstNumbers: [{ gstNumber: "123-456-789" }],
  };

  test("entity: physical address over postal, current trading names, contact and GST", () => {
    expect(parseNzbnEntity(entity)).toEqual({
      ok: true,
      data: {
        registry: "nzbn",
        id: "9429041234563",
        active: true,
        status: "Registered",
        statusSince: null,
        legalName: "Kiwi Orchards Limited",
        names: ["Kiwi Orchards Hawke's Bay", "Kiwi Orchards Limited"],
        fields: {
          taxId: "9429041234563",
          address: "45 Orchard Road",
          city: "Hastings",
          postcode: "4175",
          country: "New Zealand",
          contactEmail: "jobs@kiwiorchards.co.nz",
          contactPhone: "+64 6 878 1234",
          industry: "Apple and pear growing",
        },
        facts: [
          { label: "Type", value: "NZ Limited Company" },
          { label: "Registered", value: "2015-03-02" },
          { label: "GST no.", value: "123-456-789" },
        ],
        note: null,
      },
    });
  });

  test("entity: addresses as a plain list, removed company, nothing found", () => {
    const result = parseNzbnEntity({
      ...entity,
      entityStatusDescription: "Removed",
      addresses: [
        { addressType: "REGISTERED", address1: "1 Main St", address2: "Nelson", postCode: "7010" },
      ],
    });
    expect(result).toMatchObject({
      ok: true,
      data: {
        active: false,
        fields: { address: "1 Main St", city: "Nelson", country: "New Zealand" },
      },
    });
    expect(parseNzbnEntity({})).toMatchObject({ ok: false });
  });

  test("search: trading name shown, legal name in the detail", () => {
    expect(
      parseNzbnSearch({
        items: [
          {
            nzbn: "9429041234563",
            entityName: "KIWI ORCHARDS LIMITED",
            entityTypeDescription: "NZ Limited Company",
            entityStatusDescription: "Registered",
            tradingNames: [{ name: "Kiwi Orchards Hawke's Bay" }],
          },
          { nzbn: null, entityName: "Broken" },
        ],
      })
    ).toEqual({
      ok: true,
      data: [
        {
          id: "9429041234563",
          name: "Kiwi Orchards Hawke's Bay",
          detail: "Kiwi Orchards Limited · NZ Limited Company · Registered",
        },
      ],
    });
  });
});

describe("VIES", () => {
  test("splitVat: country prefix, spaces and dots, GR as EL", () => {
    expect(splitVat("de 123.456.789")).toEqual({ country: "DE", number: "123456789" });
    expect(splitVat("GR094259216")).toEqual({ country: "EL", number: "094259216" });
    expect(splitVat("123456789")).toBeNull();
    expect(splitVat("US123456789")).toBeNull();
  });

  test("Germany: valid, but no name or address", () => {
    const result = parseVies(
      { isValid: true, name: "---", address: "---", userError: "VALID" },
      { country: "DE", number: "123456789" }
    );
    expect(result).toMatchObject({
      ok: true,
      data: {
        id: "DE123456789",
        legalName: null,
        names: [],
        fields: { taxId: "DE123456789", country: "Germany" },
        note: expect.stringMatching(/Germany doesn't share/),
      },
    });
  });

  test("France: name and address split into the form's fields", () => {
    const result = parseVies(
      {
        valid: true,
        name: "VIGNOBLES DU SUD SARL",
        address: "12 RUE DES VIGNES\n34000 MONTPELLIER",
      },
      { country: "FR", number: "40303265045" }
    );
    expect(result).toMatchObject({
      ok: true,
      data: {
        legalName: "Vignobles Du Sud Sarl",
        fields: {
          address: "12 Rue Des Vignes",
          postcode: "34000",
          city: "Montpellier",
          country: "France",
        },
        note: null,
      },
    });
  });

  test("invalid number, or the member state down", () => {
    expect(
      parseVies({ isValid: false, userError: "INVALID" }, { country: "ES", number: "B1" })
    ).toMatchObject({
      ok: false,
      error: expect.stringMatching(/isn't registered/),
    });
    expect(
      parseVies({ isValid: false, userError: "MS_UNAVAILABLE" }, { country: "ES", number: "B1" })
    ).toMatchObject({ ok: false, error: expect.stringMatching(/Spain's VAT service/) });
  });
});

describe("defaultRegistry", () => {
  test("from the country typed, else the currency", () => {
    expect(defaultRegistry("New Zealand", "AUD")).toBe("nzbn");
    expect(defaultRegistry("Deutschland", null)).toBe("vies");
    expect(defaultRegistry("", "NZD")).toBe("nzbn");
    expect(defaultRegistry(null, "EUR")).toBe("vies");
    expect(defaultRegistry(null, "AUD")).toBe("abr");
  });
});
