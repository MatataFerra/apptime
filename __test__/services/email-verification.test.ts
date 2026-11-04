import { afterEach, describe, expect, test, vi } from "vitest";

import { checkerFrom, isDisposableEmail, isDisposableWith } from "@/services/Auth/disposable";
import {
  EMAIL_VERIFY_GRACE_MS,
  EMAIL_VERIFY_LINK_TTL_S,
  isVerificationOverdue,
} from "@/services/Auth/verification";

const now = Date.UTC(2026, 9, 30, 12);
function minutesAgo(m: number) {
  return new Date(now - m * 60 * 1000);
}

describe("isVerificationOverdue", () => {
  test("5 minutes of grace; the link itself lasts 24 hours", () => {
    expect(EMAIL_VERIFY_GRACE_MS).toBe(5 * 60 * 1000);
    expect(EMAIL_VERIFY_LINK_TTL_S).toBe(24 * 60 * 60);
  });

  test("unconfirmed: fine up to 5 minutes, overdue after", () => {
    expect(isVerificationOverdue({ emailVerified: false, createdAt: minutesAgo(4.9) }, now)).toBe(
      false
    );
    expect(isVerificationOverdue({ emailVerified: false, createdAt: minutesAgo(5) }, now)).toBe(
      false
    );
    expect(isVerificationOverdue({ emailVerified: false, createdAt: minutesAgo(5.1) }, now)).toBe(
      true
    );
  });

  test("confirmed accounts never are, however old", () => {
    expect(
      isVerificationOverdue({ emailVerified: true, createdAt: minutesAgo(100_000) }, now)
    ).toBe(false);
  });

  test("the date may come as a string (cookie cache), and missing data doesn't restrict", () => {
    expect(
      isVerificationOverdue({ emailVerified: false, createdAt: minutesAgo(10).toISOString() }, now)
    ).toBe(true);
    expect(isVerificationOverdue({ emailVerified: false, createdAt: null }, now)).toBe(false);
    expect(isVerificationOverdue({ emailVerified: false, createdAt: "nope" }, now)).toBe(false);
    expect(isVerificationOverdue(null, now)).toBe(false);
  });
});

describe("isDisposableEmail", () => {
  test.each([
    "a@10minutemail.com",
    "a@mailinator.com",
    "A@YOPMAIL.COM",
    "a@guerrillamail.com",
    "a@sub.mailinator.com",
    "  a@temp-mail.org ",
    "not-an-email",
  ])("%s is a temporary inbox", async (email) => expect(await isDisposableEmail(email)).toBe(true));

  test.each(["a@gmail.com", "ana@outlook.com", "mati@x.com", " ana@proton.me "])(
    "%s is fine",
    async (email) => expect(await isDisposableEmail(email)).toBe(false)
  );
});

describe("CMS rules", () => {
  test("block and allow rules apply on top of the list, subdomains included", () => {
    const checker = checkerFrom({ block: ["spam-cms.xyz"], allow: ["mailinator.com"] });
    expect(isDisposableWith(checker, "a@spam-cms.xyz")).toBe(true);
    expect(isDisposableWith(checker, "a@mx.spam-cms.xyz")).toBe(true);
    expect(isDisposableWith(checker, "a@mailinator.com")).toBe(false);
    expect(isDisposableWith(checker, "a@yopmail.com")).toBe(true);
  });
});

describe("blocklist fetch", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  async function load(fetchImpl: typeof fetch) {
    vi.stubEnv("CMS_BLOCKLIST_URL", "https://cms.test/api/blocklist");
    vi.stubEnv("CMS_BLOCKLIST_TOKEN", "secret");
    const fetchMock = vi.fn(fetchImpl);
    vi.stubGlobal("fetch", fetchMock);
    vi.spyOn(console, "error").mockImplementation(() => {});
    // A fresh module: its cache must not carry over from other tests.
    vi.resetModules();
    const mod = await import("@/services/Auth/disposable");
    return { mod, fetchMock };
  }

  test("uses the CMS's rules, with its token, and caches them", async () => {
    const { mod, fetchMock } = await load(async () =>
      Response.json({ block: ["spam-cms.xyz"], allow: [] })
    );
    expect(await mod.isDisposableEmail("a@spam-cms.xyz")).toBe(true);
    expect(await mod.isDisposableEmail("b@spam-cms.xyz")).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const init = fetchMock.mock.calls[0][1] as RequestInit;
    expect((init.headers as Record<string, string>).Authorization).toBe("Bearer secret");
  });

  test("falls back to the built-in list when the CMS fails", async () => {
    const { mod } = await load(async () => new Response("down", { status: 503 }));
    expect(await mod.isDisposableEmail("a@spam-cms.xyz")).toBe(false);
    expect(await mod.isDisposableEmail("a@mailinator.com")).toBe(true);
  });

  test("ignores a malformed answer", async () => {
    const { mod } = await load(async () => Response.json({ block: "spam-cms.xyz" }));
    expect(await mod.isDisposableEmail("a@spam-cms.xyz")).toBe(false);
  });
});
