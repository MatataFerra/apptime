import { describe, expect, test } from "vitest";

import {
  formatAbn,
  isValidAbn,
  parseAbnDetails,
  parseMatchingNames,
  unwrapJsonp,
} from "@/services/Registry/abr/parse";
import { tidyName } from "@/services/Registry/text";

describe("ABN checksum", () => {
  test("accepts valid ABNs with or without spaces", () => {
    expect(isValidAbn("51 824 753 556")).toBe(true);
    expect(isValidAbn("51824753556")).toBe(true);
    expect(isValidAbn("53 004 085 616")).toBe(true);
  });

  test("rejects typos and wrong lengths", () => {
    expect(isValidAbn("51 824 753 557")).toBe(false);
    expect(isValidAbn("15 824 753 556")).toBe(false);
    expect(isValidAbn("5182475355")).toBe(false);
    expect(isValidAbn("abc")).toBe(false);
  });

  test("formats as printed", () => {
    expect(formatAbn("51824753556")).toBe("51 824 753 556");
  });
});

describe("unwrapJsonp", () => {
  test("strips the callback, or reads plain JSON", () => {
    expect(unwrapJsonp('c({"a":1})')).toEqual({ a: 1 });
    expect(unwrapJsonp('callback({"a":[1,2]});\n')).toEqual({ a: [1, 2] });
    expect(unwrapJsonp('{"a":1}')).toEqual({ a: 1 });
    expect(unwrapJsonp("<html>error</html>")).toBeNull();
  });
});

describe("parseAbnDetails", () => {
  test("reads a found ABN", () => {
    const result = parseAbnDetails({
      Abn: "51824753556",
      AbnStatus: "Active",
      AbnStatusEffectiveFrom: "1999-11-01",
      Acn: "",
      AddressDate: "2014-03-12",
      AddressPostcode: "4670",
      AddressState: "QLD",
      BusinessName: ["SUNNY FARMS", " "],
      EntityName: "SUNNY HOLDINGS PTY LTD",
      EntityTypeCode: "PRV",
      EntityTypeName: "Australian Private Company",
      Gst: "2000-07-01",
      Message: "",
    });
    expect(result).toEqual({
      ok: true,
      data: {
        abn: "51 824 753 556",
        status: "Active",
        statusSince: "1999-11-01",
        entityName: "SUNNY HOLDINGS PTY LTD",
        businessNames: ["SUNNY FARMS"],
        entityType: "Australian Private Company",
        state: "QLD",
        postcode: "4670",
        gstSince: "2000-07-01",
      },
    });
  });

  test("passes on the ABR's message when nothing is found", () => {
    expect(
      parseAbnDetails({ Abn: "", EntityName: "", Message: "Search text is not a valid ABN or ACN" })
    ).toEqual({
      ok: false,
      error: "Search text is not a valid ABN or ACN",
    });
    expect(parseAbnDetails(null)).toMatchObject({ ok: false });
  });
});

describe("parseMatchingNames", () => {
  test("best first, one per ABN, only current names", () => {
    const result = parseMatchingNames({
      Message: "",
      Names: [
        {
          Abn: "53004085616",
          IsCurrent: true,
          Name: "Sunny Orchard",
          NameType: "Business Name",
          Postcode: "4670",
          State: "QLD",
          Score: 90,
        },
        {
          Abn: "51824753556",
          IsCurrent: true,
          Name: "Sunny Farms",
          NameType: "Trading Name",
          Postcode: "4670",
          State: "QLD",
          Score: 100,
        },
        {
          Abn: "51824753556",
          IsCurrent: true,
          Name: "Sunny Holdings",
          NameType: "Entity Name",
          Postcode: "4670",
          State: "QLD",
          Score: 95,
        },
        {
          Abn: "11111111111",
          IsCurrent: false,
          Name: "Old Sunny",
          NameType: "Business Name",
          Score: 99,
        },
      ],
    });
    expect(result.ok && result.data.map((m) => [m.abn, m.name])).toEqual([
      ["51 824 753 556", "Sunny Farms"],
      ["53 004 085 616", "Sunny Orchard"],
    ]);
  });

  test("no names: the ABR's message", () => {
    expect(parseMatchingNames({ Message: "No records found", Names: [] })).toEqual({
      ok: false,
      error: "No records found",
    });
    expect(parseMatchingNames({ Message: "", Names: [] })).toEqual({ ok: true, data: [] });
  });
});

describe("tidyName", () => {
  test("title-cases names in capitals, leaves mixed case alone", () => {
    expect(tidyName("SUNNY FARMS PTY LTD")).toBe("Sunny Farms Pty Ltd");
    expect(tidyName("THE TRUSTEE FOR SMITH AND SONS TRUST")).toBe(
      "The Trustee for Smith and Sons Trust"
    );
    expect(tidyName("O'BRIEN NSW ORCHARDS")).toBe("O'brien NSW Orchards");
    expect(tidyName("McDonald Farms")).toBe("McDonald Farms");
    expect(tidyName("VIGNOBLES DU SUD SARL")).toBe("Vignobles du Sud SARL");
    expect(tidyName("BÄCKEREI MÜLLER GMBH & CO. KG")).toBe("Bäckerei Müller GmbH & Co. KG");
    expect(tidyName("DE LA HUERTA S.L.")).toBe("De la Huerta S.L.");
  });
});
