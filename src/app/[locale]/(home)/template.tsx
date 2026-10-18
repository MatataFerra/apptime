"use client";

import { type PropsWithChildren, useEffect } from "react";

import { useQueryClient } from "@tanstack/react-query";
import { usePathname } from "next/navigation";
import { useLocale } from "next-intl";

import { PATH_NAMES } from "@/utils/constants/pathnames";
import { invalidateShiftQueries } from "@/utils/helpers/invalidateShiftQueries";

export default function Template({ children }: PropsWithChildren) {
  const qC = useQueryClient();
  const pathname = usePathname();
  const locale = useLocale();

  // Entering the dashboard always shows fresh shifts, whatever happened
  // elsewhere in the app since the lists were cached.
  useEffect(() => {
    if (pathname === `/${locale}${PATH_NAMES.DASHBOARD}`) {
      invalidateShiftQueries(qC);
    }
  }, [locale, pathname, qC]);

  return <>{children}</>;
}
