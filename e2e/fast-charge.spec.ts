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
  await page.getByRole("textbox", { name: /Hour value/ }).fill("27");
  await page.getByRole("textbox", { name: /Unpaid breaks/ }).fill("1");
  await page.getByRole("textbox", { name: /Holidaypay rate/ }).fill("8");

  await page.getByRole("button", { name: /Save shift/ }).click();

  const toast = await page
    .getByText(/successfully/)
    .first()
    .textContent();

  expect(toast).toBeTruthy();
});
