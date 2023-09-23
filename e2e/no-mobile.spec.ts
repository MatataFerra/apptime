import { expect, test } from "@playwright/test";

import { ENTRY_URL } from "./constants";

// Define the test environment
// defineConfig({
//   testDir: "e2e",
//   timeout: 60000,
//   retries: 2,
//   use: {
//     headless: true,
//     viewport: { width: 1600, height: 1200 },
//     ignoreHTTPSErrors: true,
//     screenshot: "on",
//     video: "on",
//     locale: "en",
//   },
// });

test("should signin in desktop and goes to /no-mobile", async ({ page }) => {
  await page.goto("http://localhost:3000/");
  await page.waitForURL(ENTRY_URL);
  // login
  await page.getByRole("textbox").first().fill("usuario1@example.com");
  await page.getByRole("textbox").last().fill("secreto1");

  await page.getByText("Login").click();
  // check if we are on the home page
  await expect(page).toHaveURL("http://localhost:3000/en/no-mobile");
});
