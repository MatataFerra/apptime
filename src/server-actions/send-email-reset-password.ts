"use server";

import { headers } from "next/headers";

import { clientIp, consumeRateLimit } from "@/services/RateLimit";

import { auth } from "@/utils/auth";
import { isLocale } from "@/utils/helpers/locale";

/**
 * auth.api calls skip Better Auth's limiter, so the email has its own:
 * per address (nobody's inbox gets flooded) and per IP (one client can't
 * go through a list of addresses or burn the Resend quota).
 */
const PER_EMAIL = { window: 60 * 60, max: 3 };
const PER_IP = { window: 60 * 60, max: 10 };

const TOO_MANY = {
  response: false,
  message: "Too many attempts. Please try again in a while.",
} as const;

/**
 * Starts a password reset with Better Auth. The email (sent from the auth
 * config through Resend) links to /{locale}/reset/{token}. The answer is
 * the same whether or not the email has an account.
 */
export default async function onSendEmailToResetPassword(email: string, locale?: string) {
  try {
    const address = String(email ?? "")
      .trim()
      .toLowerCase();
    const ip = clientIp(await headers());

    // IP first: a client going through many addresses is stopped before it
    // uses up anyone's per-address slots.
    if (!(await consumeRateLimit(`reset-email:ip:${ip}`, PER_IP))) return TOO_MANY;
    if (!(await consumeRateLimit(`reset-email:to:${address}`, PER_EMAIL))) return TOO_MANY;

    await auth.api.requestPasswordReset({
      body: { email: address, redirectTo: `/${locale && isLocale(locale) ? locale : "en"}/reset` },
    });
    return { response: true, message: "Email sent" };
  } catch (error) {
    // eslint-disable-next-line no-console -- server log for failed resets
    console.error("[send-email-reset-password]", error);
    return { response: false, message: "We couldn't send the email. Please try again." };
  }
}
