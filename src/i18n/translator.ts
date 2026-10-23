import { createTranslator, type Messages } from "next-intl";

import type { Locale } from "@/types";

import en from "../../messages/en.json";
import es from "../../messages/es.json";

const MESSAGES: Record<Locale, Messages> = { en, es };

/**
 * A translator for code that runs outside a page or a request with a
 * locale (emails sent from the auth config, scripts, tests). Pages and
 * components use `useTranslations` / `getTranslations` instead.
 */
export function translatorFor(locale: Locale) {
  return createTranslator({ locale, messages: MESSAGES[locale] ?? MESSAGES.en });
}
