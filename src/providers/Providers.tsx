"use client";
import React from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { SessionProvider } from "next-auth/react";
import { NextIntlClientProvider } from "next-intl";

import ut from "@/services/Utilities/client";

type Props = {
  children?: React.ReactNode;
  i18n: {
    messages: Record<string, string>;
    locale: string;
  };
};

const queryClient = new QueryClient();

function Providers({ children, i18n }: Props) {
  return (
    <>
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
    </>
  );
}

export default Providers;
