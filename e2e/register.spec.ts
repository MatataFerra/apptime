import { expect, test } from "@playwright/test";

import randomEmail from "../src/utils/helpers/generateRandomEmail";
import { createUser, USER_CREDENTIALS } from "./constants";

test.use({
  isMobile: true,
});

test.beforeEach(async ({ page }) => {
  await page.goto("http://localhost:3000/");

  if (page.url().includes("register")) {
    await page.getByRole("button").click();
  }

  await page.waitForURL(/login/);
  // login
  await page.getByText(/register|registro/).click();

  //register
  await page.waitForURL(/register/);

  const { email, password } = createUser({ email: randomEmail() });

  // buttons
  await page.locator("[name=fullname]").fill("User testing");
  await page.locator("[name=email]").fill(email);
  await page.locator("[name=password]").fill(password);

  await page.getByRole("button").first().click();
});

test("should see the toast", async ({ page }) => {
  await expect(page.getByText(/succefully|éxito/).first()).toBeVisible();
});

test("Should show spinner", async ({ page }) => {
  const spinner = page.locator("css=.spinner");
  await expect(spinner).toBeVisible();
});

test("Should redirect properly", async ({ page }) => {
  await page.waitForURL("http://localhost:3000/en");

  expect(page.url()).toBe("http://localhost:3000/en");
});
