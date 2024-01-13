"use client";
import React from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SessionProvider } from "next-auth/react";
import { NextIntlClientProvider } from "next-intl";

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
