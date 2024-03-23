import { expect, test } from "@playwright/test";

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

  await page.goto("http://localhost:3000/en/fast-charge");
});

test("user can fill up the form and submit", async ({ page }) => {
  await page.waitForURL(/fast-charge/);

  await page.getByRole("textbox", { name: /Start date/ }).fill("2022-01-01");
  await page.getByRole("textbox", { name: /Start time/ }).fill("12:00");
  await page.getByRole("textbox", { name: /Finish date/ }).fill("2022-01-01");
  await page.getByRole("textbox", { name: /Finish time/ }).fill("14:00");

  const title = page.getByText("You are going to charge:");
  const startDate = page.getByText("Sat 1st, January 2022");
  const workedData = page.getByText("Worked time: 2h 0m");
  const earningsData = page.getByText(/44/);

  expect(await title.isVisible()).toBeTruthy();
  expect(await startDate.isVisible()).toBeTruthy();
  expect(await workedData.isVisible()).toBeTruthy();
  expect(await earningsData.isVisible()).toBeTruthy();

  await page.getByRole("button", { name: /Submit/ }).click();

  const toast = await page
    .getByText(/successfully/)
    .first()
    .textContent();

  expect(toast).toBeTruthy();
});
