import type { Locale } from "@/types";

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
    <div>
      <h1>{t("email.reset_password.greeting", { name: firstName })}</h1>
      <p>
        {t("email.reset_password.intro")} <strong>{t("email.reset_password.ignore")}</strong>
      </p>
      <p>{t("email.reset_password.cta")}</p>
      <a href={link}>
        <span>{link}</span>
      </a>
    </div>
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
    <div>
      <h1>{t("email.verify_email.greeting", { name: firstName })}</h1>
      <p>{t("email.verify_email.intro")}</p>
      <p>{t("email.verify_email.cta")}</p>
      <a href={url}>
        <span>{url}</span>
      </a>
      <p>
        <strong>{t("email.verify_email.ignore")}</strong>
      </p>
    </div>
  );
}
