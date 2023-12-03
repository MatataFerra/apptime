import { expect, Page, test } from "@playwright/test";

import randomEmail from "../src/utils/helpers/generateRandomEmail";
import { createUser, USER_CREDENTIALS } from "./constants";

function fillForm(page: Page) {
  return async () => {
    await page.getByRole("textbox").first().fill("John");
    await page.getByRole("textbox").last().fill("Doe");

    await page.getByRole("button", { name: "Next" }).click();

    await page.getByLabel("Hour value").fill("10");
    await page.getByLabel("Start time").fill("08:00");
    await page.getByLabel("Finish time").fill("17:00");

    await page.getByRole("button", { name: "Next" }).click();

    await page.getByRole("radio", { name: "Yes" }).last().click();
    await page.getByTestId("input-unpaidBreaks").fill("1");

    await page.getByRole("button", { name: "Submit" }).click();
  };
}

const { email, password } = createUser({ email: randomEmail() });

test.use({
  isMobile: true,
});

test.beforeEach(async ({ page }, testInfo) => {
  await page.goto("http://localhost:3000/");
  await page.waitForURL(/login/);

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

  // login
  await page.getByRole("textbox").first().fill(USER_CREDENTIALS.email);
  await page.getByRole("textbox").last().fill(USER_CREDENTIALS.password);

  await page.getByRole("button", { name: "Login" }).click({
    force: true,
  });

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

  expect(message).toMatch(/\b(?:Your profile has been created|Profile already exists)\b/i);
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
    .getByText(/Your profile has been created|Profile already exists/)
    .first()
    .textContent();

  expect(message).toMatch(/\bProfile already exists\b/i);
});

test("Should show success message if profile is created", async ({ page }) => {
  await fillForm(page)();

  const message = await page
    .getByText(/Your profile has been created|Profile already exists/)
    .first()
    .textContent();

  expect(message).toMatch(/\bYour profile has been created\b/i);
});

test("Should see the loading message", async ({ page }) => {
  await fillForm(page)();

  const loader = await page
    .getByText(/We are creating your profile/)
    .first()
    .textContent();

  expect(loader).toMatch(/\bWe are creating your profile\b/i);
});
