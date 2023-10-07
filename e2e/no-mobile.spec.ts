import { expect, test } from "@playwright/test";

import { USER_CREDENTIALS } from "./constants";

test.use({
  isMobile: false,
  browserName: "chromium",
});

test("should signin in desktop and goes to /no-mobile", async ({ page }) => {
  await page.goto("http://localhost:3000/");
  await page.waitForURL(/login/, {
    waitUntil: "domcontentloaded",
  });

  const text = page.getByText("This app is only available for mobile devices");
  const input = page.getByRole("textbox", { name: /email/ });

  expect(text).toBeInViewport();
  expect(input).toBeInViewport();
});
