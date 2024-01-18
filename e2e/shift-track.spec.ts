import { expect, test } from "@playwright/test";
import { addHours } from "date-fns";

import { USER_CREDENTIALS } from "./constants";

test.use({
  isMobile: true,
});

test.beforeEach(async ({ page }) => {
  await page.goto("http://localhost:3000/");
  await page.waitForURL(/login/);

  await page.getByRole("textbox").first().fill("usuario2@example.com");
  await page.getByRole("textbox").last().fill("Secreto2!");

  await page.getByRole("button", { name: "Login" }).click({
    force: true,
  });

  const finishButton = page.getByRole("button", { name: /Finish/ });

  if (await finishButton.isEnabled()) {
    await finishButton.click();
    await page.getByRole("button", { name: /move/ }).click();
  }

  await page.waitForURL(/en/);
});

test("user can start a shift", async ({ page }) => {
  const start = page.getByRole("button", { name: /Start/ });
  await start.click();
  expect(page.getByRole("dialog")).toBeVisible();
  await page.getByRole("button", { name: /regular/ }).click();
  expect(page.getByText(/online/)).toBeVisible();
  expect(start).toBeDisabled();
});

test("user can end a shift", async ({ page }) => {
  await page.getByRole("button", { name: /Start/ }).click();
  expect(page.getByRole("dialog")).toBeVisible();
  await page.getByRole("button", { name: /regular/ }).click();
  await page.getByRole("button", { name: /Finish/ }).click();
  await page.getByRole("button", { name: /move/ }).click();
  expect(page.getByRole("button", { name: /Finish/ })).toBeDisabled();
});
