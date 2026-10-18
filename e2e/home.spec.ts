import { expect, test } from "@playwright/test";

test.use({
  isMobile: true,
});

test("Should see the main page", async ({ page }) => {
  await page.goto("http://localhost:3000/");
  const title = page.getByText(/Welcome|Hi /);
  expect(title).toBeVisible();
});

test("Shold render main modules options", async ({ page }) => {
  await page.goto("http://localhost:3000/");
  const mainModulesTitle = page.getByText("Log work");
  const moduleFast = page.getByTestId("option-card-fast-charge");
  const moduleTrack = page.getByTestId("option-card-track");
  const moduleProduction = page.getByTestId("option-card-production");
  expect(mainModulesTitle).toBeVisible();
  expect(moduleFast).toBeVisible();
  expect(moduleTrack).toBeVisible();
  expect(moduleProduction).toBeVisible();
});

test("Should render the shortcuts", async ({ page }) => {
  await page.goto("http://localhost:3000/");
  const shortcutsTitle = page.getByText("See your money");
  const shortcutDash = page.getByTestId("option-card-dashboard");
  const shortcutIncomes = page.getByTestId("option-card-incomes");
  const shortcutCompare = page.getByTestId("option-card-compare");
  expect(shortcutsTitle).toBeVisible();
  expect(shortcutDash).toBeVisible();
  expect(shortcutIncomes).toBeVisible();
  expect(shortcutCompare).toBeVisible();
});
