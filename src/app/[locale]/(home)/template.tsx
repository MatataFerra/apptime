"use client";

import { type PropsWithChildren, useEffect } from "react";

import { useQueryClient } from "@tanstack/react-query";
import { usePathname } from "next/navigation";
import { useLocale } from "next-intl";

import { PATH_NAMES } from "@/utils/constants/pathnames";
import { USE_QUERY_KEYS } from "@/utils/constants/use-query";
import useUser from "@/hooks/useUser";

export default function Template({ children }: PropsWithChildren) {
  const queryClient = useQueryClient();
  const pathname = usePathname();
  const locale = useLocale();
  const { data } = useUser();

  useEffect(() => {
    let refresh = true;

    if (pathname === `/${locale}${PATH_NAMES.DASHBOARD}`) {
      if (!refresh) return;

      queryClient.invalidateQueries({
        queryKey: [USE_QUERY_KEYS.USER, data?.email],
      });

      refresh = false;

      return () => {
        refresh = true;
      };
    }
  }, [data?.email, locale, pathname, queryClient]);

  return <>{children}</>;
}
