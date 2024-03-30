import React from "react";

import ut from "@/services/Utilities/client";

import { LocaleParams } from "@/types";

import { Toaster } from "@/components/ui/Toast/toaster";

import Providers from "@/providers/Providers";

import "@/app/globals.css";

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: LocaleParams;
}) {
  let messages;

  try {
    messages = (await import(`#/messages/${params.locale}.json`)).default;
  } catch (error) {
    ut.redirectTo(`/`);
  }

  return (
    <>
      <Providers i18n={{ messages, locale: params.locale }}>{children}</Providers>
      <Toaster />
    </>
  );
}
