"use client";
import { ReactNode, useEffect } from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { SessionProvider } from "next-auth/react";
import { type AbstractIntlMessages, NextIntlClientProvider } from "next-intl";

import ut from "@/services/Utilities/client";

type Props = {
  children?: ReactNode;
  i18n: {
    messages: AbstractIntlMessages;
    locale: string;
  };
};

const queryClient = new QueryClient();

function Providers({ children, i18n }: Props) {
  const { locale } = i18n;
  useEffect(() => {
    if (locale) {
      document.documentElement.setAttribute("lang", locale);
    }
  }, [locale]);
  return (
    <QueryClientProvider client={queryClient}>
      {ut.toBool(process.env.NEXT_PUBLIC_SHOW_DEVTOOLS) && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
      <SessionProvider>
        <NextIntlClientProvider {...i18n} timeZone="UTC">
          {children}
        </NextIntlClientProvider>
      </SessionProvider>
    </QueryClientProvider>
  );
}

export default Providers;
