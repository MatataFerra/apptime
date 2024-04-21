import { notFound } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "next-auth/middleware";
import createIntlMiddleware from "next-intl/middleware";

import i18n from "@/services/i18n";
import TokenService from "@/services/Token";
import ut from "@/services/Utilities";

import { SUPPORTED_LOCALES, USER_ROLES } from "@/utils/constants";
import { PATH_NAMES } from "@/utils/constants/pathnames";

import { withAuthMiddleware } from "./middlewares/auth";
import { chain } from "./middlewares/chain";
import { i18nMiddleware } from "./middlewares/i18n";

const localeDefault: any = {};
const intlMiddleware = createIntlMiddleware({
  locales: [...SUPPORTED_LOCALES],
  defaultLocale: "en",
  localePrefix: "always",
});

export default withAuth(async function middleware(req: NextRequest) {
  intlMiddleware(req);
  const nextPathName = req.nextUrl.pathname;
  const I18N = new i18n("en");
  const locale = I18N.getLocale(req) ?? "en";
  localeDefault.locale = locale;
  const parsedPath = i18n.parsePathname(nextPathName, locale);

  const pathnameIsMissingLocale = i18n.isMissingLocale(nextPathName);

  if (pathnameIsMissingLocale) {
    // e.g. incoming request is /products
    // The new URL is now /en-US/products;
    return ut.redirect(req, parsedPath);
  }

  if (i18n.isRouteSupported(PATH_NAMES.ADMIN, nextPathName)) {
    const token = await new TokenService("next-auth.session-token").decodedCookieData();

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
});

// export default chain([withAuthMiddleware, i18nMiddleware])

export const config = {
  //! tratar de reemplazar con un array de rutas para evitar escribirlas a mano
  matcher: [
    "/",
    "/es",
    "/en",
    "/form",
    "/es/form",
    "/en/form",
    "/admin",
    "/es/admin",
    "/en/admin",
    "/history-shifts",
    "/es/history-shifts",
    "/en/history-shifts",
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
