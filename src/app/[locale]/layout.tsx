import type { ReactNode } from "react";

import dynamic from "next/dynamic";
import { redirect } from "next/navigation";

import type { LocaleParams } from "@/types";

import { PATH_NAMES } from "@/utils/constants/pathnames";

import "../globals.css";

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
  children: ReactNode;
  params: LocaleParams;
}) {
  let messages;

  try {
    messages = (await import(`../../../messages/${params.locale}.json`)).default;
  } catch (error) {
    redirect(PATH_NAMES.HOME);
  }

  return (
    <>
      <Providers i18n={{ messages, locale: params.locale }}>{children}</Providers>
      <Toaster />
    </>
  );
}
