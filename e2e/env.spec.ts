import test, { expect } from "@playwright/test";

test("Check .env variables", async ({ page }) => {
  const env = process.env.NEXT_PUBLIC_SHOW_DEVTOOLS;

  // eslint-disable-next-line no-console
  console.log("NEXT_PUBLIC", env);

  expect(env).toBe("0");
});

test("Convert env variable to boolean", async ({ page }) => {
  const env = process.env.NEXT_PUBLIC_SHOW_DEVTOOLS;
  const bool = Boolean(Number(env));

  // eslint-disable-next-line no-console
  console.log("NEXT_PUBLIC", env);
  // eslint-disable-next-line no-console
  console.log("NEXT_PUBLIC", Boolean(Number(env)));

  expect(bool).toBeFalsy();
});
