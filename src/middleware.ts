import { NextRequest, NextResponse } from "next/server";

import i18n from "@/services/i18n";
import TokenService from "@/services/Token";
import ut from "@/services/Utilities";

import { NEXT_AUTH_SESSION_TOKEN, USER_ROLES } from "@/utils/constants";
import { PATH_NAMES } from "@/utils/constants/pathnames";

export default async function middleware(req: NextRequest) {
  const nextPathName = req.nextUrl.pathname;
  const I18N = new i18n("en");
  const locale = I18N.getLocale(req) ?? "en";
  const parsedPath = i18n.parsePathname(nextPathName, locale);

  const pathnameIsMissingLocale = i18n.isMissingLocale(nextPathName);

  if (pathnameIsMissingLocale) {
    // e.g. incoming request is /products
    // The new URL is now /en-US/products;
    return ut.redirect(req, parsedPath);
  }

  if (i18n.isRouteSupported(PATH_NAMES.ADMIN, nextPathName)) {
    const token = await new TokenService(NEXT_AUTH_SESSION_TOKEN).decodedCookieData();

    if (token?.role !== USER_ROLES.ADMIN) {
      return ut.redirect(req, PATH_NAMES.HOME);
    }

    NextResponse.next();
  }

  if (i18n.isRouteSupported(PATH_NAMES.NO_MOBILE, nextPathName)) {
    const homePath = i18n.parsePathname(PATH_NAMES.HOME, locale);

    if (ut.isMobile({ request: req })) {
      return ut.redirect(req, homePath);
    }
  } else {
    const noMobilePath = i18n.parsePathname(PATH_NAMES.NO_MOBILE, locale);

    if (!ut.isMobile({ request: req })) {
      return ut.redirect(req, noMobilePath);
    }
  }
}

// export default chain([withAuthMiddleware, i18nMiddleware])

export const config = {
  //! tratar de reemplazar con un array de rutas para evitar escribirlas a mano
  matcher: [
    "/",
    "/es",
    "/en",
    "/admin",
    "/es/admin",
    "/en/admin",
    "/compare",
    "/es/compare",
    "/en/compare",
    "/track",
    "/es/track",
    "/en/track",
    "/settings",
    "/es/settings",
    "/en/settings",
    "/dashboard",
    "/es/dashboard",
    "/en/dashboard",
    "/no-mobile",
    "/es/no-mobile",
    "/en/no-mobile",
    "/fast-charge",
    "/es/fast-charge",
    "/en/fast-charge",
    "/incomes",
    "/es/incomes",
    "/en/incomes",
    "/production",
    "/es/production",
    "/en/production",
  ],
};
