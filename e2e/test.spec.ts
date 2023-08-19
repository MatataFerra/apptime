import { test, expect } from "@playwright/test";
test.use({
  viewport: { width: 1600, height: 1200 },
  locale: "en",
});

test("should navigate to the about page", async ({ page }) => {
  await page.goto("http://localhost:3000/");
  await expect(page).toHaveURL("http://localhost:3000/api/auth/signin?callbackUrl=%2F");
});
