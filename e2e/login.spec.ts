//! Por ahora falla por no encontrar correctamente los items

import { expect, test } from "@playwright/test";

import { ENTRY_URL } from "./constants";

test("should show passwords errors", async ({ page }) => {
  await page.goto("http://localhost:3000/");
  await page.waitForURL(ENTRY_URL);
  // login
  await page.getByRole("textbox").first().fill("usuario1@example.com");
  await page.getByRole("textbox").last().fill("secreto1");

  await page.getByRole("textbox").first().click();

  const listOne = page.getByRole("listitem").nth(1);
  const listTwo = page.getByRole("listitem").nth(2);
  const listThree = page.getByRole("listitem").nth(3);
  const listFour = page.getByRole("listitem").nth(4);

  expect(listOne).toHaveClass("text-red-500");
  expect(listTwo).toHaveClass("text-green-500");
  expect(listThree).toHaveClass("text-green-500");
  expect(listFour).toHaveClass("text-red-500");
});
