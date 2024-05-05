"use client";

import { ReactElement, useMemo } from "react";

import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useLocale } from "next-intl";

import { PATH_NAMES } from "@/utils/constants/pathnames";

interface Props {
  children: ReactElement;
}

export default function HomeTemplate({ children }: Props) {
  const path = usePathname();
  const { status } = useSession();
  const router = useRouter();
  const locale = useLocale();
  const PUBLIC = useMemo(
    () => [
      "/",
      `/${locale}`,
      `/${locale}${PATH_NAMES.NO_MOBILE}`,
      `/${locale}${PATH_NAMES.LOGIN}`,
      `${locale}${PATH_NAMES.REGISTER}`,
    ],
    [locale]
  );

  if (status === "unauthenticated" && !PUBLIC.includes(path as `/${string}`)) {
    return router.push(`/${locale}${PATH_NAMES.LOGIN}?redirect=${path}`);
  } else {
    return <>{children}</>;
  }
}
