import { expect, test } from "@playwright/test";

import { USER_CREDENTIALS } from "./constants";

test.use({
  isMobile: true,
});

test("should show passwords errors", async ({ page }) => {
  await page.goto("http://localhost:3000/");
  await page.waitForURL(/login/);
  // login
  await page.getByRole("textbox").first().fill(USER_CREDENTIALS.email);
  await page.getByRole("textbox").last().fill(USER_CREDENTIALS.wrong_password);

  await page.getByRole("button", { name: "Login" }).click({
    force: true,
  });

  const spinner = page.locator("css=.spinner");

  expect(spinner).toBeVisible();
});
