"use server";

import { auth } from "@/utils/auth";
import { isLocale } from "@/utils/helpers/locale";

/**
 * Starts a password reset with Better Auth. The email (sent from the auth
 * config through Resend) links to /{locale}/reset/{token}. The answer is
 * the same whether or not the email has an account.
 */
export default async function onSendEmailToResetPassword(email: string, locale?: string) {
  try {
    await auth.api.requestPasswordReset({
      body: { email, redirectTo: `/${locale && isLocale(locale) ? locale : "en"}/reset` },
    });
    return { response: true, message: "Email sent" };
  } catch (error) {
    // eslint-disable-next-line no-console -- server log for failed resets
    console.error("[send-email-reset-password]", error);
    return { response: false, message: "We couldn't send the email. Please try again." };
  }
}
