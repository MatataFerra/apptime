import { describe, expect, test } from "vitest";

import { describeDevice } from "@/utils/helpers/device";

describe("describeDevice", () => {
  test.each([
    [
      "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1",
      { browser: "Safari", os: "iOS", mobile: true },
    ],
    [
      "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/130.0 Mobile/15E148 Safari/604.1",
      { browser: "Chrome", os: "iOS", mobile: true },
    ],
    [
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36 Edg/130.0",
      { browser: "Edge", os: "Windows", mobile: false },
    ],
    [
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36",
      { browser: "Chrome", os: "macOS", mobile: false },
    ],
    [
      "Mozilla/5.0 (Linux; Android 14; SM-S911B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/26.0 Chrome/122.0 Mobile Safari/537.36",
      { browser: "Samsung Internet", os: "Android", mobile: true },
    ],
    [
      "Mozilla/5.0 (X11; Linux x86_64; rv:131.0) Gecko/20100101 Firefox/131.0",
      { browser: "Firefox", os: "Linux", mobile: false },
    ],
  ])("%s", (ua, expected) => {
    expect(describeDevice(ua)).toEqual(expected);
  });

  test("nothing to go on", () => {
    expect(describeDevice(null)).toEqual({ browser: null, os: null, mobile: false });
  });
});
