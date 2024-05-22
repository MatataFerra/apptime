import { expect, test } from "@playwright/test";

test.use({
  isMobile: true,
});

test.beforeEach(async ({ page }) => {
  await page.goto("http://localhost:3000/en/dashboard");
  await page.waitForURL(/login/);

  await page.getByRole("textbox").first().fill("usuario2@example.com");
  await page.getByRole("textbox").last().fill("Secreto2!");

  await page.getByRole("button", { name: "Login" }).click({
    force: true,
  });

  await page.goto("http://localhost:3000/en/dashboard");
});

test("user can see history shifts list", async ({ page }) => {
  const title = page.getByText(/History Shifts/);
  const table = page.getByRole("table");

  expect(await title.isVisible()).toBeTruthy();
  expect(await table.isVisible()).toBeTruthy();
});

test("user can see carousel", async ({ page }) => {
  await page.waitForURL(/history-shifts/);

  const card = page.getByText(/saved/);

  expect(await card.isVisible()).toBeTruthy();
});
