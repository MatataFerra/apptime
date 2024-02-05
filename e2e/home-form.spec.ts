import { expect, Page, test } from "@playwright/test";

import randomEmail from "../src/utils/helpers/generateRandomEmail";
import { createUser, fillForm, USER_CREDENTIALS } from "./constants";

test.use({
  isMobile: true,
});

test.beforeEach(async ({ page }, testInfo) => {
  await page.goto("http://localhost:3000/en");
  await page.waitForURL(/login/);
  const { email, password } = createUser({ email: randomEmail() });

  if (testInfo.title.includes("Should show success message if profile is created")) {
    // register new unique user
    await page.getByText(/register|registro/).click();

    //register
    await page.waitForURL(/register/);

    // buttons
    await page.locator("[name=email]").fill(email);
    await page.locator("[name=password]").fill(password);

    await page.getByRole("button").first().click();

    await page.waitForURL("http://localhost:3000/en");

    await page.getByRole("button", { name: /click here/ }).click();

    await page.waitForURL(/form/);

    return;
  }

  if (testInfo.title.includes("Should show error if profile already exists")) {
    // login
    await page.locator("[name=email]").fill(USER_CREDENTIALS.email);
    await page.locator("[name=password]").fill(USER_CREDENTIALS.password);

    await page.getByRole("button", { name: /Login/ }).click();

    await page.waitForURL("http://localhost:3000/en");

    await page.goto("http://localhost:3000/en/form");

    await page.waitForURL(/form/);

    return;
  }

  // create new user
  await page.getByText(/register|registro/).click();
  await page.waitForURL(/register/);

  // buttons
  await page.locator("[name=email]").fill(email);
  await page.locator("[name=password]").fill(password);

  await page.getByRole("button").first().click();

  await page.waitForURL("http://localhost:3000/en");

  expect(page.getByText("Please fill the form before start")).toBeVisible();

  await page.getByRole("button", { name: /click here/ }).click();

  await page.waitForURL(/form/);
});

test("Should complete the profile form", async ({ page }) => {
  await fillForm(page)();

  const message = await page
    .getByText(/Your profile has been created|Profile already exists/)
    .first()
    .textContent();

  expect(message).toMatch(/\b(?:Your profile has been created|Something has gone wrong)\b/i);
});

test("Should show error message when the form is not completed", async ({ page }) => {
  await page.getByRole("button", { name: "Next" }).click();
  await page.getByRole("button", { name: "Next" }).click();
  await page.getByRole("button", { name: "Submit" }).click();

  expect(page.getByText(/Something has gone wrong/).last()).toBeVisible();
});

test("Should show error if profile already exists", async ({ page }) => {
  await fillForm(page)();

  const message = await page
    .getByText(/Your profile has been created|Something has gone wrong/)
    .first()
    .textContent();

  expect(message).toMatch(/\bSomething has gone wrong\b/i);
});

test("Should show success message if profile is created", async ({ page }) => {
  await fillForm(page)();

  const message = await page
    .getByText(/Your profile has been created|Something has gone wrong/)
    .first()
    .textContent();

  expect(message).toMatch(/\bYour profile has been created\b/i);
});
