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

  await page.getByTestId("ham").click();
});

test("user can see Fast Charge", async ({ page }) => {
  expect(await page.isVisible("text=Fast charge")).toBeTruthy();
});

test("user can see History Shift", async ({ page }) => {
  expect(await page.isVisible("text=History of Shifts")).toBeTruthy();
});
