import { expect, Page, test } from "@playwright/test";

import { fillForm, USER_CREDENTIALS } from "./constants";

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
  await page.waitForURL(/en/);
  const clickHere = page.getByRole("button", { name: /click here/ });

  if (await clickHere.isVisible()) {
    await clickHere.click();
    await page.waitForURL(/form/);

    await fillForm(page)();
  }

  await page.waitForURL(/en/);

  const finish = page.getByRole("button", { name: /Finish/ });

  if (await finish.isEnabled()) {
    await finish.click();
  }
});

test("user can start a shift", async ({ page }) => {
  const start = page.getByRole("button", { name: /Start/ });
  await start.click();
  expect(page.getByRole("dialog")).toBeVisible();
  await page.getByRole("button", { name: /regular/ }).click();
  expect(page.getByText(/Open/)).toBeVisible();
  expect(start).toBeDisabled();
});

test("user can end a shift", async ({ page }) => {
  await page.getByRole("button", { name: /Start/ }).click();
  expect(page.getByRole("dialog")).toBeVisible();
  await page.getByRole("button", { name: /regular/ }).click();
  await page.getByRole("button", { name: /Finish/ }).click();
  expect(page.getByRole("button", { name: /Finish/ })).toBeDisabled();
});
