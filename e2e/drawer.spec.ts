import { expect, test } from "@playwright/test";

test.use({
  isMobile: true,
});

test("user can Open the drawer", async ({ page }) => {
  await page.goto("http://localhost:3000/");
  await page.getByTestId("ham").click();
  expect(await page.isVisible("text=Fast charge")).toBeTruthy();
});

test("should click outside and close the drawer", async ({ page }) => {
  await page.goto("http://localhost:3000/");
  await page.getByTestId("ham").click();
  expect(await page.isVisible("text=Fast charge")).toBeTruthy();
  await page.getByTestId("drawer-close").click();
  expect(await page.isVisible("text=Dashboard")).toBeFalsy();
});
