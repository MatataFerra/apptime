import { describe, expect, test } from "vitest";

import { parseEmployerText } from "@/services/Employer/paste";

describe("parseEmployerText", () => {
  test("an Australian email signature", () => {
    const { fields, guessed } = parseEmployerText(`Liz Turner
Sunny Farms Pty Ltd
ABN 51 824 753 556
12 Packhouse Rd, Bundaberg QLD 4670
M: 0412 345 678 | E: jobs@sunny.com.au
www.sunnyfarms.com.au`);

    expect(fields).toMatchObject({
      name: "Sunny Farms Pty Ltd",
      taxId: "51 824 753 556",
      address: "12 Packhouse Rd",
      city: "Bundaberg",
      region: "QLD",
      postcode: "4670",
      country: "Australia",
      contactPhone: "0412 345 678",
      contactEmail: "jobs@sunny.com.au",
    });
    expect(guessed).toEqual(["name"]);
  });

  test("labelled lines win and aren't guessed", () => {
    const { fields, guessed } = parseEmployerText(`Employer: Bundaberg Fresh
ABN: 53004085616
Address: 4 Mill St, Childers QLD 4660
Contact: Mark
Phone: +61 7 4126 0000
Industry: Farming`);

    expect(fields).toEqual({
      name: "Bundaberg Fresh",
      taxId: "53 004 085 616",
      address: "4 Mill St",
      city: "Childers",
      region: "QLD",
      postcode: "4660",
      country: "Australia",
      contactName: "Mark",
      contactPhone: "+61 7 4126 0000",
      industry: "Farming",
    });
    expect(guessed).toEqual([]);
  });

  test("street and town on separate lines", () => {
    const { fields } = parseEmployerText(`Riverland Grapes
88 Sturt Highway
Renmark SA 5341`);
    expect(fields).toMatchObject({
      name: "Riverland Grapes",
      address: "88 Sturt Highway",
      city: "Renmark",
      region: "SA",
      postcode: "5341",
    });
  });

  test("a German address and an Argentine CUIT", () => {
    expect(
      parseEmployerText(`Bäckerei Müller GmbH
Hauptstraße 5
10115 Berlin
Deutschland
Tel. 030 1234567`).fields
    ).toMatchObject({
      name: "Bäckerei Müller GmbH",
      address: "Hauptstraße 5",
      postcode: "10115",
      city: "Berlin",
      country: "Deutschland",
      contactPhone: "030 1234567",
    });

    expect(parseEmployerText("Viñedos del Sur SRL\nCUIT 30-71234567-8").fields).toMatchObject({
      name: "Viñedos del Sur SRL",
      taxId: "30-71234567-8",
    });
  });

  test("an invalid ABN, a date or an amount isn't taken for anything", () => {
    const { fields } = parseEmployerText(`Pay date 2026-10-23
Gross $1,234.50
ABN 51 824 753 557`);
    expect(fields.taxId).toBeUndefined();
    expect(fields.contactPhone).toBeUndefined();
  });

  test("empty text: nothing", () => {
    expect(parseEmployerText("  \n ")).toEqual({ fields: {}, guessed: [] });
  });
});
