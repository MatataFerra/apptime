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
