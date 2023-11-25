import { expect, test } from "@playwright/test";

import { USER_CREDENTIALS } from "./constants";

test.use({
  isMobile: true,
});

test.beforeEach(async ({ page }) => {
  await page.goto("http://localhost:3000/");
  await page.waitForURL(/login/);
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

test("Should complete the profile form succefuly", async ({ page }) => {
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

  const loader = page.getByText(/We are creating your profile/).last();
  const message = page.getByText(/Your profile has been created|Profile already exists/).last();

  expect(loader).toBeVisible({
    visible: true,
  });
  expect(message).toBeVisible({
    timeout: 6000,
  });
});

test("Should show error message when the form is not completed", async ({ page }) => {
  await page.getByRole("button", { name: "Next" }).click();
  await page.getByRole("button", { name: "Next" }).click();
  await page.getByRole("button", { name: "Submit" }).click();

  expect(page.getByText(/Something has gone wrong/).last()).toBeVisible();
});
