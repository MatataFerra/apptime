import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { getMessages } from "next-intl/server";

import Providers from "@/providers/Providers";

import { SUPPORTED_LOCALES } from "@/utils/constants";
import { PATH_NAMES } from "@/utils/constants/pathnames";
import { isLocale } from "@/utils/helpers/locale";

import "../globals.css";

import { Toaster } from "./lazy";

export function generateStaticParams() {
  return SUPPORTED_LOCALES.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!isLocale(locale)) redirect(PATH_NAMES.HOME);
  // Same loader as the next-intl request config (src/i18n.ts).
  const [messages, session] = await Promise.all([getMessages({ locale }), getServerSession()]);

  return (
    <>
      <Providers i18n={{ messages, locale }} session={session}>
        {children}
      </Providers>
      <Toaster />
    </>
  );
}
