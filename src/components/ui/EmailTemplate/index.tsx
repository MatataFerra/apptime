import type { Locale } from "@/types";

import {
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
  /** Better Auth's verify link: applies the change and goes back to Settings. */
  url: string;
  locale: Locale;
}

/** Confirms a new email address before it replaces the current one. */
export function VerifyEmailTemplate({ firstName, url, locale }: VerifyEmailTemplateProps) {
  const t = translatorFor(locale);

  return (
    <EmailLayout
      lang={locale}
      title={t("email.verify_email.subject")}
      preview={t("email.verify_email.preview")}
      footer={t("email.footer")}
    >
      <EmailHeading>{t("email.verify_email.greeting", { name: firstName })}</EmailHeading>
      <EmailText>{t("email.verify_email.body")}</EmailText>
      <EmailButton href={url}>{t("email.verify_email.button")}</EmailButton>
      <EmailFallbackLink label={t("email.fallback")} href={url} />
      <EmailNote>{t("email.verify_email.not_you")}</EmailNote>
    </EmailLayout>
  );
}
