import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  session: { user: { id: "u1" } } as { user: { id: string } } | null,
  allowed: true,
}));

vi.mock("server-only", () => ({}));
vi.mock("@/utils/auth/session", () => ({ getSession: async () => mocks.session }));
vi.mock("@/services/RateLimit", () => ({ consumeRateLimit: vi.fn(async () => mocks.allowed) }));

import { consumeRateLimit } from "@/services/RateLimit";

import { onLookupBusiness } from "@/server-actions/business-lookup";

const fetchMock = vi.fn();

function answer(body: unknown, status = 200) {
  const text = typeof body === "string" ? body : JSON.stringify(body);
  fetchMock.mockResolvedValueOnce(new Response(text, { status }));
}

function calledUrl(i = 0) {
  return new URL(fetchMock.mock.calls[i][0]);
}

beforeEach(() => {
  mocks.session = { user: { id: "u1" } };
  mocks.allowed = true;
  process.env.ABR_GUID = "abr-guid";
  process.env.NZBN_API_KEY = "nz-key";
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
  vi.mocked(consumeRateLimit).mockClear();
});

afterEach(() => vi.unstubAllGlobals());

describe("onLookupBusiness", () => {
  test("Australia: an ABN goes to AbnDetails with the GUID", async () => {
    answer(
      'c({"Abn":"51824753556","AbnStatus":"Active","EntityName":"SUNNY HOLDINGS PTY LTD","AddressState":"QLD"})'
    );
    const result = await onLookupBusiness("abr", "51 824 753 556");
    expect(calledUrl().pathname).toBe("/json/AbnDetails.aspx");
    expect(calledUrl().searchParams.get("guid")).toBe("abr-guid");
    expect(result).toMatchObject({
      ok: true,
      kind: "details",
      details: { registry: "abr", id: "51 824 753 556" },
      searchedAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T/),
    });
    expect(consumeRateLimit).toHaveBeenCalledWith("business-lookup:user:u1", expect.anything());
  });

  test("New Zealand: NZBN to /entities/{nzbn} with the key; a name to the search", async () => {
    answer({
      nzbn: "9429041234563",
      entityName: "KIWI ORCHARDS LIMITED",
      entityStatusDescription: "Registered",
    });
    const details = await onLookupBusiness("nzbn", "9429041234563");
    expect(calledUrl().href).toBe(
      "https://api.business.govt.nz/gateway/nzbn/v5/entities/9429041234563"
    );
    expect(fetchMock.mock.calls[0][1].headers).toMatchObject({
      "Ocp-Apim-Subscription-Key": "nz-key",
    });
    expect(details).toMatchObject({
      ok: true,
      kind: "details",
      details: { legalName: "Kiwi Orchards Limited" },
    });

    answer({ items: [{ nzbn: "9429041234563", entityName: "KIWI ORCHARDS LIMITED" }] });
    const matches = await onLookupBusiness("nzbn", "Kiwi Orchards");
    expect(calledUrl(1).pathname).toBe("/gateway/nzbn/v5/entities");
    expect(calledUrl(1).searchParams.get("search-term")).toBe("Kiwi Orchards");
    expect(matches).toMatchObject({
      ok: true,
      kind: "matches",
      matches: [{ id: "9429041234563" }],
    });
  });

  test("New Zealand: unknown NZBN (404) is 'not found', not an error", async () => {
    answer("", 404);
    expect(await onLookupBusiness("nzbn", "9429041234563")).toEqual({
      ok: false,
      error: "No business found with that NZBN",
    });
  });

  test("EU: VIES by country and number, no key", async () => {
    answer({ isValid: true, name: "---", address: "---" });
    const result = await onLookupBusiness("vies", "DE 123 456 789");
    expect(calledUrl().href).toBe(
      "https://ec.europa.eu/taxation_customs/vies/rest-api/ms/DE/vat/123456789"
    );
    expect(result).toMatchObject({ ok: true, details: { id: "DE123456789", legalName: null } });
  });

  test("typos and name searches where they don't apply: no call, no quota", async () => {
    expect(await onLookupBusiness("abr", "51 824 753 557")).toMatchObject({ ok: false });
    expect(await onLookupBusiness("nzbn", "9429041234564")).toMatchObject({ ok: false });
    expect(await onLookupBusiness("vies", "Bäckerei Müller")).toMatchObject({
      ok: false,
      error: expect.stringMatching(/country code/),
    });
    expect(fetchMock).not.toHaveBeenCalled();
    expect(consumeRateLimit).not.toHaveBeenCalled();
  });

  test("needs a session, the register's key, a valid register and quota", async () => {
    mocks.session = null;
    expect(await onLookupBusiness("abr", "Sunny")).toEqual({ ok: false, error: "Not signed in" });
    mocks.session = { user: { id: "u1" } };

    delete process.env.NZBN_API_KEY;
    expect(await onLookupBusiness("nzbn", "Kiwi")).toMatchObject({
      ok: false,
      error: expect.stringMatching(/New Zealand lookup isn't available/),
    });

    expect(await onLookupBusiness("xx" as never, "Sunny")).toMatchObject({ ok: false });

    mocks.allowed = false;
    expect(await onLookupBusiness("abr", "Sunny")).toMatchObject({
      ok: false,
      error: expect.stringMatching(/Too many/),
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  test("a register down: a plain error", async () => {
    answer("oops", 500);
    expect(await onLookupBusiness("vies", "FR40303265045")).toEqual({
      ok: false,
      error: "The register didn't answer, try again later",
    });
  });
});
