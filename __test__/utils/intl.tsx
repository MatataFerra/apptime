import type { ReactElement, ReactNode } from "react";

import { render } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";

import en from "#/messages/en.json";
import es from "#/messages/es.json";

const MESSAGES = { en, es };

/** next-intl's provider with the app's messages, for components that translate. */
export function IntlWrapper({
  children,
  locale = "en",
}: {
  children: ReactNode;
  locale?: "en" | "es";
}) {
  return (
    <NextIntlClientProvider locale={locale} messages={MESSAGES[locale]} timeZone="UTC">
      {children}
    </NextIntlClientProvider>
  );
}

/** `render` inside the intl provider (English unless `locale` says otherwise). */
export function renderWithIntl(ui: ReactElement, locale: "en" | "es" = "en") {
  return render(ui, {
    wrapper: ({ children }) => <IntlWrapper locale={locale}>{children}</IntlWrapper>,
  });
}
