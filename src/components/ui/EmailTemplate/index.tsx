import type { Locale } from "@/types";

import { PATH_NAMES } from "@/utils/constants/pathnames";

import {
  appBaseUrl,
  EmailButton,
  EmailFallbackLink,
  EmailHeading,
  EmailLayout,
  EmailNote,
  EmailText,
} from "./Layout";
import { translatorFor } from "@/i18n/translator";

interface EmailTemplateProps {
  firstName: string;
  url: string;
  locale: Locale;
  endpoint: string;
  token: string;
}

/** The password reset email, in the language of the page that asked for it. */
export function EmailTemplate({ firstName, url, locale, endpoint, token }: EmailTemplateProps) {
  const t = translatorFor(locale);
  const link = `${url}${locale}/${endpoint}/${token}`;

  return (
    <EmailLayout
      lang={locale}
      title={t("email.reset_password.subject")}
      preview={t("email.reset_password.preview")}
      footer={t("email.footer")}
    >
      <EmailHeading>{t("email.reset_password.greeting", { name: firstName })}</EmailHeading>
      <EmailText>{t("email.reset_password.body")}</EmailText>
      <EmailButton href={link}>{t("email.reset_password.button")}</EmailButton>
      <EmailFallbackLink label={t("email.fallback")} href={link} />
      <EmailNote>{t("email.reset_password.not_you")}</EmailNote>
    </EmailLayout>
  );
}

interface VerifyEmailTemplateProps {
  firstName: string;
  /** Better Auth's verify link: marks the address verified and goes back to the app. */
  url: string;
  locale: Locale;
  /** signup: confirm the account's email; change: confirm a new one from Settings. */
  kind?: "signup" | "change";
}

/** Confirms the email of a new account, or a new address before it replaces the current one. */
export function VerifyEmailTemplate({
  firstName,
  url,
  locale,
  kind = "change",
}: VerifyEmailTemplateProps) {
  const t = translatorFor(locale);

  return (
    <EmailLayout
      lang={locale}
      title={t(`email.verify_email.${kind}.subject`)}
      preview={t(`email.verify_email.${kind}.preview`)}
      footer={t("email.footer")}
    >
      <EmailHeading>{t("email.verify_email.greeting", { name: firstName })}</EmailHeading>
      <EmailText>{t(`email.verify_email.${kind}.body`)}</EmailText>
      <EmailButton href={url}>{t("email.verify_email.button")}</EmailButton>
      <EmailFallbackLink label={t("email.fallback")} href={url} />
      <EmailNote>{t(`email.verify_email.${kind}.not_you`)}</EmailNote>
    </EmailLayout>
  );
}

export type SecurityNoticeKind = "password_changed" | "password_created" | "email_change";

interface SecurityNoticeProps {
  firstName: string;
  locale: Locale;
  kind: SecurityNoticeKind;
  /** "Safari on iOS", when the request said. */
  device?: string | null;
  /** For "email_change": the address asked for. */
  newEmail?: string;
}

/**
 * "Your password was changed" and the like: a heads-up to the account's own
 * address, with a way back in if it wasn't you (reset the password).
 */
export function SecurityNoticeTemplate({
  firstName,
  locale,
  kind,
  device,
  newEmail,
}: SecurityNoticeProps) {
  const t = translatorFor(locale);
  const reset = `${appBaseUrl()}${locale}${PATH_NAMES.RESET_PASSWORD}`;

  return (
    <EmailLayout
      lang={locale}
      title={t(`email.security.${kind}.subject`)}
      preview={t(`email.security.${kind}.preview`)}
      footer={t("email.security.footer")}
    >
      <EmailHeading>{t(`email.security.${kind}.title`)}</EmailHeading>
      <EmailText>{t("email.security.greeting", { name: firstName })}</EmailText>
      <EmailText>{t(`email.security.${kind}.body`, { email: newEmail ?? "" })}</EmailText>
      {device ? <EmailText muted>{t("email.security.device", { device })}</EmailText> : null}
      <EmailNote>{t(`email.security.${kind}.not_you`)}</EmailNote>
      <EmailButton href={reset}>{t("email.security.reset_button")}</EmailButton>
    </EmailLayout>
  );
}
