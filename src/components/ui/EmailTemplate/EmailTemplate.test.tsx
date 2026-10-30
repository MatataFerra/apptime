import { render, toPlainText } from "@react-email/render";
import { describe, expect, test } from "vitest";

import { EmailTemplate, VerifyEmailTemplate } from "@/components/ui/EmailTemplate";

describe("email templates", () => {
  test("reset password: button and fallback link to the reset page, in Spanish", async () => {
    const html = await render(
      EmailTemplate({
        firstName: "Mati",
        url: "https://nomadshift.test/",
        locale: "es",
        endpoint: "reset",
        token: "tok123",
      })
    );
    const link = "https://nomadshift.test/es/reset/tok123";

    expect(html).toContain('lang="es"');
    expect(html).toContain("Hola, Mati");
    expect(html).toContain("Elegir contraseña nueva");
    // Once in the button, once shown in full as the fallback.
    expect(html.split(`href="${link}"`)).toHaveLength(3);
    expect(toPlainText(html)).toContain(link);
  });

  test("verify email: English copy and Better Auth's link", async () => {
    const url =
      "https://nomadshift.test/api/auth/verify-email?token=abc&callbackURL=%2Fen%2Fsettings";
    const html = await render(VerifyEmailTemplate({ firstName: "Mati", url, locale: "en" }));
    const text = toPlainText(html);

    expect(html).toContain("Confirm my email");
    expect(html).toContain("Confirm this address to use it for your account.");
    expect(text.toLowerCase()).toContain("hi, mati"); // headings come out in capitals
    expect(text).toContain("https://nomadshift.test/api/auth/verify-email?token=abc");
  });
});
