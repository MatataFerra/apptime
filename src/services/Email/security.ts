import type { Locale } from "@/types";

import { type SecurityNoticeKind, SecurityNoticeTemplate } from "@/components/ui/EmailTemplate";

import { describeDevice } from "@/utils/helpers/device";
import { isLocale } from "@/utils/helpers/locale";

import "server-only";

import { sendEmail } from "./index";
import { LOCALE_COOKIE } from "@/i18n/routing";
import { translatorFor } from "@/i18n/translator";

/** The app's language for a request: its locale cookie, else Accept-Language. */
export function localeFromHeaders(headers?: Headers | null): Locale {
  const cookie = headers?.get("cookie") ?? "";
  const fromCookie = new RegExp(`(?:^|;\\s*)${LOCALE_COOKIE}=([a-z]{2})`).exec(cookie)?.[1];
  if (isLocale(fromCookie)) return fromCookie;
  const accepted = headers?.get("accept-language")?.slice(0, 2).toLowerCase();
  return isLocale(accepted) ? accepted : "en";
}

/** "Safari on iOS" from the request, in the email's language; null if unknown. */
function deviceFrom(headers: Headers | null | undefined, locale: Locale) {
  const { browser, os } = describeDevice(headers?.get("user-agent"));
  if (browser && os) return translatorFor(locale)("email.security.on", { browser, os });
  return browser ?? os ?? null;
}

/**
 * Tells the account's own address that its password or email is changing.
 * Never throws: a failed notice is logged, and the change itself stands.
 */
export async function sendSecurityNotice({
  to,
  name,
  kind,
  headers,
  newEmail,
}: {
  to: string;
  name: string;
  kind: SecurityNoticeKind;
  headers?: Headers | null;
  newEmail?: string;
}) {
  const locale = localeFromHeaders(headers);
  try {
    await sendEmail({
      local: "security",
      to,
      subject: translatorFor(locale)(`email.security.${kind}.subject`),
      email: SecurityNoticeTemplate({
        firstName: name,
        locale,
        kind,
        device: deviceFrom(headers, locale),
        newEmail,
      }),
    });
  } catch (error) {
    // eslint-disable-next-line no-console -- server log for a failed notice
    console.error("[security-notice]", kind, error);
  }
}
