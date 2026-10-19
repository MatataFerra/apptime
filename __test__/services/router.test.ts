import { describe, expect, test } from "vitest";

import Router from "@/services/Router";

describe("Router", () => {
  test("reads the locale from the start of the pathname", () => {
    expect(Router.localeFromPath("/es/track")).toBe("es");
    expect(Router.localeFromPath("/en")).toBe("en");
    expect(Router.localeFromPath("/track")).toBeUndefined();
    expect(Router.localeFromPath("/estimate")).toBeUndefined();
  });

  test("a private route is matched whatever the browser language", () => {
    const privates = new Router(["/track"]).addLocalesToRoutes();
    const path = "/es/track";
    const locale = Router.localeFromPath(path) ?? "en";
    expect(privates.isRoute(Router.addLocale(path, locale))).toBe(true);
  });
});
