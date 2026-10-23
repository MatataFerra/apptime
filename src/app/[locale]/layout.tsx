import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";

import Providers from "@/providers/Providers";

import { getSession, toClientSession } from "@/utils/auth/session";
import { SUPPORTED_LOCALES } from "@/utils/constants";
import { PATH_NAMES } from "@/utils/constants/pathnames";
import { isLocale } from "@/utils/helpers/locale";

import "../globals.css";

import { Toaster } from "./lazy";

export function generateStaticParams() {
  return SUPPORTED_LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: LayoutProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({
    locale: isLocale(locale) ? locale : "en",
    namespace: "metadata",
  });
  return { title: t("title"), description: t("description") };
}

export default async function LocaleLayout({ children, params }: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!isLocale(locale)) redirect(PATH_NAMES.HOME);
  setRequestLocale(locale);
  // Same loader as the next-intl request config (src/i18n/request.ts).
  const [messages, session] = await Promise.all([getMessages({ locale }), getSession()]);

  return (
    <>
      <Providers i18n={{ messages, locale }} session={toClientSession(session)}>
        {children}
      </Providers>
      <Toaster />
    </>
  );
}
