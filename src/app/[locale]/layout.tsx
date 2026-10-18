import { redirect } from "next/navigation";
import { getMessages } from "next-intl/server";

import { SUPPORTED_LOCALES } from "@/utils/constants";
import { PATH_NAMES } from "@/utils/constants/pathnames";
import { isLocale } from "@/utils/helpers/locale";

import "../globals.css";

import { Providers, Toaster } from "./lazy";

export function generateStaticParams() {
  return SUPPORTED_LOCALES.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!isLocale(locale)) redirect(PATH_NAMES.HOME);
  // Same loader as the next-intl request config (src/i18n.ts).
  const messages = await getMessages({ locale });

  return (
    <>
      <Providers i18n={{ messages, locale }}>{children}</Providers>
      <Toaster />
    </>
  );
}
