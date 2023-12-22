import { NextFetchEvent, NextRequest, NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";

import { SUPPORTED_LOCALES } from "@/utils/constants";

import { CustomMiddleware } from "./chain";

const intlMiddleware = createMiddleware({
  locales: [...SUPPORTED_LOCALES],
  defaultLocale: "en",
  localePrefix: "always",
});

export function i18nMiddleware(middleware: CustomMiddleware) {
  return async (req: NextRequest, event: NextFetchEvent) => {
    const response = NextResponse.next();

    intlMiddleware(req);

    return middleware(req, event, response);
  };
}
