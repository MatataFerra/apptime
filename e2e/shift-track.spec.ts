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
  }

  await page.waitForURL(/en/);
});

test("user can start a shift", async ({ page }) => {
  const start = page.getByRole("button", { name: /Start/ });
  await start.click();
  expect(page.getByRole("dialog")).toBeVisible();
  const input = page.getByTestId("hourValue");

  if (await input.isVisible()) {
    await input.fill("27");
    await page.getByRole("button", { name: /Save/ }).click();
    expect(
      page
        .getByText(/created/)
        .first()
        .textContent()
    ).toBeTruthy();
  } else {
    await page.getByRole("button", { name: /Start/ }).click();
    expect(
      page
        .getByText(/created/)
        .first()
        .textContent()
    ).toBeTruthy();
  }
});

test("user can end a shift", async ({ page }) => {
  await page.getByRole("button", { name: /Start/ }).click();
  expect(page.getByRole("dialog")).toBeVisible();
  const input = page.getByTestId("hourValue");
  if (await input.isVisible()) {
    await input.fill("27");
    await page.getByRole("button", { name: /Save/ }).click();
  } else {
    await page.getByRole("button", { name: /Start/ }).click();
  }
  await page.getByRole("button", { name: /Finish/ }).click();
  expect(page.getByRole("button", { name: /Finish/ })).toBeDisabled();
});
