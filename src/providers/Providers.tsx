"use client";
import React from "react";
import { SessionProvider } from "next-auth/react";
import LangProvider from "./LangProvider";
import { Locale } from "#/i18n/i18n-config";

type Props = {
  children?: React.ReactNode;
  locale?: Locale
};

function Providers({ children, locale = "en" }: Props) {
  return (
    <>
    <LangProvider locale={locale}>
      <SessionProvider>{children}</SessionProvider>
    </LangProvider>
    </>
  );
}

export default Providers;
