import { expect, test } from "@playwright/test";

import { USER_CREDENTIALS } from "./constants";

test.use({
  isMobile: false,
  browserName: "chromium",
  viewport: {
    width: 1920,
    height: 1080,
  },
});

test("should signin in desktop and goes to /no-mobile", async ({ page }) => {
  await page.goto("http://localhost:3000/");

  const text = page.getByText("This app is only available for mobile devices");
  const input = page.getByRole("textbox", { name: /email/ });

  await expect(text).toBeVisible();
  await expect(input).toBeVisible();
});
