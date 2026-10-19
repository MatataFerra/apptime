"use client";
import { type ReactNode, useEffect, useState } from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import type { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { type AbstractIntlMessages, NextIntlClientProvider } from "next-intl";

import ut from "@/services/Utilities/client";

type Props = {
  children?: ReactNode;
  /** Read on the server, so the client doesn't wait for /api/auth/session. */
  session: Session | null;
  i18n: {
    messages: AbstractIntlMessages;
    locale: string;
  };
};

function Providers({ children, i18n, session }: Props) {
  // One client per browser tab, and a fresh one per request on the server:
  // a module-level client would share cached user data between requests.
  const [queryClient] = useState(() => new QueryClient());
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
      <SessionProvider session={session}>
        <NextIntlClientProvider {...i18n} timeZone="UTC">
          {children}
        </NextIntlClientProvider>
      </SessionProvider>
    </QueryClientProvider>
  );
}

export default Providers;
