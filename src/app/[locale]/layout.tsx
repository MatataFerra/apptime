import React from "react";

import dynamic from "next/dynamic";
import { redirect } from "next/navigation";

import { LocaleParams } from "@/types";

import "@/app/globals.css";

const Providers = dynamic(() => import("@/providers/Providers"), {
  ssr: false,
});

const Toaster = dynamic(() => import("@/components/ui/Toast/toaster"), {
  ssr: false,
});

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
    redirect("/");
  }

  return (
    <>
      <Providers i18n={{ messages, locale: params.locale }}>{children}</Providers>
      <Toaster />
    </>
  );
}
