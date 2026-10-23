import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  session: { user: { id: "u1" } } as { user: { id: string } } | null,
  allowed: true,
}));

vi.mock("server-only", () => ({}));
vi.mock("@/utils/auth/session", () => ({ getSession: async () => mocks.session }));
vi.mock("@/services/RateLimit", () => ({ consumeRateLimit: vi.fn(async () => mocks.allowed) }));

import { consumeRateLimit } from "@/services/RateLimit";

import { onLookupAbn } from "@/server-actions/abn-lookup";

const fetchMock = vi.fn();

function answer(body: string) {
  fetchMock.mockResolvedValueOnce(new Response(body, { status: 200 }));
}

beforeEach(() => {
  mocks.session = { user: { id: "u1" } };
  mocks.allowed = true;
  process.env.ABR_GUID = "test-guid";
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
  vi.mocked(consumeRateLimit).mockClear();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("onLookupAbn", () => {
  test("an ABN: calls AbnDetails with the GUID and reads the JSONP answer", async () => {
    answer(
      'c({"Abn":"51824753556","AbnStatus":"Active","AbnStatusEffectiveFrom":"1999-11-01","AddressPostcode":"4670","AddressState":"QLD","BusinessName":["SUNNY FARMS"],"EntityName":"SUNNY HOLDINGS PTY LTD","EntityTypeName":"Australian Private Company","Gst":"2000-07-01","Message":""})'
    );

    const result = await onLookupAbn("51 824 753 556");

    const url = new URL(fetchMock.mock.calls[0][0]);
    expect(url.pathname).toBe("/json/AbnDetails.aspx");
    expect(url.searchParams.get("abn")).toBe("51824753556");
    expect(url.searchParams.get("guid")).toBe("test-guid");
    expect(result).toMatchObject({
      ok: true,
      kind: "details",
      details: { abn: "51 824 753 556", entityName: "SUNNY HOLDINGS PTY LTD", state: "QLD" },
    });
    expect(consumeRateLimit).toHaveBeenCalledWith("abn-lookup:user:u1", expect.anything());
  });

  test("a name: searches MatchingNames", async () => {
    answer(
      'c({"Message":"","Names":[{"Abn":"51824753556","IsCurrent":true,"Name":"SUNNY FARMS","NameType":"Business Name","Postcode":"4670","State":"QLD","Score":100}]})'
    );

    const result = await onLookupAbn("Sunny Farms");

    const url = new URL(fetchMock.mock.calls[0][0]);
    expect(url.pathname).toBe("/json/MatchingNames.aspx");
    expect(url.searchParams.get("name")).toBe("Sunny Farms");
    expect(result).toMatchObject({
      ok: true,
      kind: "matches",
      matches: [{ abn: "51 824 753 556" }],
    });
  });

  test("a mistyped ABN is caught without calling the register or using the quota", async () => {
    expect(await onLookupAbn("51 824 753 557")).toMatchObject({ ok: false });
    expect(fetchMock).not.toHaveBeenCalled();
    expect(consumeRateLimit).not.toHaveBeenCalled();
  });

  test("needs a session, a GUID, a long enough query and quota left", async () => {
    mocks.session = null;
    expect(await onLookupAbn("Sunny")).toEqual({ ok: false, error: "Not signed in" });

    mocks.session = { user: { id: "u1" } };
    delete process.env.ABR_GUID;
    expect(await onLookupAbn("Sunny")).toMatchObject({ ok: false });

    process.env.ABR_GUID = "test-guid";
    expect(await onLookupAbn("ab")).toMatchObject({ ok: false });

    mocks.allowed = false;
    expect(await onLookupAbn("Sunny")).toMatchObject({
      ok: false,
      error: expect.stringMatching(/Too many/),
    });

    expect(fetchMock).not.toHaveBeenCalled();
  });

  test("the register down or answering HTML: a plain error", async () => {
    fetchMock.mockResolvedValueOnce(new Response("oops", { status: 500 }));
    expect(await onLookupAbn("Sunny")).toMatchObject({ ok: false });

    answer("<html>maintenance</html>");
    expect(await onLookupAbn("Sunny")).toMatchObject({ ok: false });
  });
});
