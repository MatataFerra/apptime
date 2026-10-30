import { describe, expect, test, vi } from "vitest";

import { type AccessUser, decideAccess, ROUTE_RULES } from "@/services/Router/access";

import { config } from "@/proxy";

vi.mock("@/utils/auth", () => ({ auth: { api: { getSession: vi.fn() } } }));

type GetUser = () => Promise<AccessUser>;

async function signedOut(): Promise<AccessUser> {
  return null;
}
async function user(): Promise<AccessUser> {
  return { role: "USER" };
}
async function admin(): Promise<AccessUser> {
  return { role: "ADMIN" };
}

function decide(
  pathname: string,
  { isMobile = true, getUser = signedOut }: { isMobile?: boolean; getUser?: GetUser } = {}
) {
  return decideAccess({ pathname, preferredLocale: "es", isMobile, getUser });
}

const next = { type: "next" };

function to(pathname: string, redirectBack?: string) {
  return redirectBack
    ? { type: "redirect", pathname, redirectBack }
    : { type: "redirect", pathname };
}

describe("decideAccess", () => {
  test("adds the browser's locale when the URL has none", async () => {
    expect(await decide("/")).toEqual(to("/es"));
    expect(await decide("/track")).toEqual(to("/es/track"));
    expect(await decide("/login")).toEqual(to("/es/login"));
    expect(await decide("/estimate")).toEqual(to("/es/estimate"));
  });

  test.each(Object.entries(ROUTE_RULES).filter(([, rule]) => rule.access === "private"))(
    "%s: signed out goes to login and comes back after",
    async (path) => {
      expect(await decide(`/en${path}`)).toEqual(to("/en/login", `/en${path}`));
      expect(await decide(`/es${path}`)).toEqual(to("/es/login", `/es${path}`));
    }
  );

  test("private pages open when signed in, sub-paths included", async () => {
    expect(await decide("/en/track", { getUser: user })).toEqual(next);
    expect(await decide("/en/dashboard/history", { getUser: user })).toEqual(next);
    expect(await decide("/en/dashboard/history")).toEqual(to("/en/login", "/en/dashboard/history"));
  });

  test("admin: only the ADMIN role, back to Home in the same language otherwise", async () => {
    expect(await decide("/es/admin", { getUser: user })).toEqual(to("/es"));
    expect(await decide("/es/admin", { getUser: admin })).toEqual(next);
  });

  test("guest pages send signed-in users Home", async () => {
    for (const path of ["/login", "/register", "/forgot-password", "/success"]) {
      expect(await decide(`/en${path}`, { getUser: user })).toEqual(to("/en"));
      expect(await decide(`/en${path}`)).toEqual(next);
    }
  });

  test("the reset link works signed in, signed out and on a computer", async () => {
    for (const getUser of [signedOut, user]) {
      expect(await decide("/en/reset/abc123", { getUser })).toEqual(next);
      expect(await decide("/en/reset/abc123", { getUser, isMobile: false })).toEqual(next);
    }
  });

  test("computers go to /no-mobile, except login, register and the reset link", async () => {
    expect(await decide("/en", { isMobile: false })).toEqual(to("/en/no-mobile"));
    expect(await decide("/es/track", { isMobile: false, getUser: user })).toEqual(
      to("/es/no-mobile")
    );
    expect(await decide("/en/forgot-password", { isMobile: false })).toEqual(to("/en/no-mobile"));
    expect(await decide("/en/login", { isMobile: false })).toEqual(next);
    expect(await decide("/en/register", { isMobile: false })).toEqual(next);
  });

  test("/no-mobile: computers stay, phones go Home", async () => {
    expect(await decide("/es/no-mobile", { isMobile: false })).toEqual(next);
    expect(await decide("/es/no-mobile")).toEqual(to("/es"));
  });

  test("public pages let anyone in; unknown ones and the reset link don't read the session", async () => {
    for (const path of ["/en", "/en/compare", "/en/incomes"]) {
      expect(await decide(path, { getUser: user })).toEqual(next);
    }
    const getUser = vi.fn(user);
    for (const path of ["/en/reset/x", "/en/nope"]) {
      expect(await decide(path, { getUser })).toEqual(next);
    }
    expect(getUser).not.toHaveBeenCalled();
  });

  describe("an email not confirmed in time", () => {
    function hours(n: number) {
      return new Date(Date.now() - n * 60 * 60 * 1000);
    }
    async function overdue(): Promise<AccessUser> {
      return {
        role: "USER",
        emailVerified: false,
        createdAt: hours(9),
      };
    }
    async function inGrace(): Promise<AccessUser> {
      return {
        role: "USER",
        emailVerified: false,
        createdAt: hours(7),
      };
    }
    async function verified(): Promise<AccessUser> {
      return {
        role: "USER",
        emailVerified: true,
        createdAt: hours(100),
      };
    }

    test.each(["/es", "/es/track", "/es/settings", "/es/compare", "/es/login", "/es/admin"])(
      "past 8 hours: %s goes to the confirm page",
      async (path) => {
        expect(await decide(path, { getUser: overdue })).toEqual(to("/es/verify-email"));
      }
    );

    test("past 8 hours: the confirm page and the reset link still open", async () => {
      expect(await decide("/es/verify-email", { getUser: overdue })).toEqual(next);
      expect(await decide("/es/reset/abc", { getUser: overdue })).toEqual(next);
    });

    test("within 8 hours, or confirmed: the app as usual, and the confirm page goes Home", async () => {
      for (const getUser of [inGrace, verified]) {
        expect(await decide("/es/track", { getUser })).toEqual(next);
        expect(await decide("/es/verify-email", { getUser })).toEqual(to("/es"));
      }
    });

    test("signed out: the confirm page asks to sign in", async () => {
      expect(await decide("/es/verify-email")).toEqual(to("/es/login", "/es/verify-email"));
    });
  });

  test("a path that only starts like a route isn't that route", async () => {
    expect(await decide("/en/trackers")).toEqual(next);
    expect(await decide("/en/administrator")).toEqual(next);
  });
});

describe("proxy matcher", () => {
  // Next compiles each source to an anchored regexp.
  function matches(path: string) {
    return config.matcher.some((source) => new RegExp(`^${source}$`).test(path));
  }

  test.each(["/", "/en", "/es/track", "/en/reset/abc123", "/login", "/en/dashboard/history"])(
    "runs on page %s",
    (path) => expect(matches(path)).toBe(true)
  );

  test.each([
    "/api/auth/get-session",
    "/api/shift/hourly",
    "/_next/static/chunk.js",
    "/_next/image",
    "/_vercel/insights/script.js",
    "/icon.svg",
    "/assets/bg.png",
  ])("skips %s", (path) => expect(matches(path)).toBe(false));
});
