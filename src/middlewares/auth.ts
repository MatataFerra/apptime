import { NextFetchEvent, NextRequest, NextResponse } from "next/server";
import { withAuth } from "next-auth/middleware";
import createMiddleware from "next-intl/middleware";

import i18n from "@/services/i18n";
import TokenService from "@/services/Token";
import ut from "@/services/Utilities";

import { NEXT_AUTH_SESSION_TOKEN, SUPPORTED_LOCALES, USER_ROLES } from "@/utils/constants";
import { PATH_NAMES } from "@/utils/constants/pathnames";

import { CustomMiddleware } from "./chain";

const localeDefault: any = {};

export function withAuthMiddleware(middleware: CustomMiddleware) {
  return withAuth(async (req: NextRequest, event: NextFetchEvent) => {
    const response = NextResponse.next();

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
      const token = await new TokenService(NEXT_AUTH_SESSION_TOKEN).decodedCookieData();

      if (token?.role !== USER_ROLES.ADMIN) ut.redirect(req, PATH_NAMES.HOME);

      NextResponse.next();
    }

    if (i18n.isRouteSupported(PATH_NAMES.HOME, nextPathName)) {
      const noMobilePath = i18n.parsePathname(PATH_NAMES.NO_MOBILE, locale);

      if (!ut.isMobile({ request: req })) {
        return ut.redirect(req, noMobilePath);
      }
    }

    if (i18n.isRouteSupported(PATH_NAMES.NO_MOBILE, nextPathName)) {
      const homePath = i18n.parsePathname(PATH_NAMES.HOME, locale);

      if (ut.isMobile({ request: req })) {
        return ut.redirect(req, homePath);
      }
    }

    return middleware(req, event, response);
  });
}

// function auth() {
//   withAuth(async function middleware(req: NextRequest) {
//     const nextPathName = req.nextUrl.pathname;
//     const I18N = new i18n("en");
//     const locale = I18N.getLocale(req) ?? "en";
//     localeDefault.locale = locale;
//     const parsedPath = i18n.parsePathname(nextPathName, locale);

//     const pathnameIsMissingLocale = i18n.isMissingLocale(nextPathName);

//     if (pathnameIsMissingLocale) {
//       // e.g. incoming request is /products
//       // The new URL is now /en-US/products;
//       return ut.redirect(req, parsedPath);
//     }

//     if (i18n.isRouteSupported(PATH_NAMES.ADMIN, nextPathName)) {
//       const cookie = req.cookies.get("next-auth.session-token");
//       const token = await new TokenService(cookie).decodedCookieData();

//       if (token?.role !== USER_ROLES.ADMIN) ut.redirect(req, PATH_NAMES.HOME);

//       NextResponse.next();
//     }

//     if (i18n.isRouteSupported(PATH_NAMES.HOME, nextPathName)) {
//       const noMobilePath = i18n.parsePathname(PATH_NAMES.NO_MOBILE, locale);

//       if (!ut.isMobile({ request: req })) {
//         return ut.redirect(req, noMobilePath);
//       }
//     }

//     if (i18n.isRouteSupported(PATH_NAMES.NO_MOBILE, nextPathName)) {
//       const homePath = i18n.parsePathname(PATH_NAMES.HOME, locale);

//       if (ut.isMobile({ request: req })) {
//         return ut.redirect(req, homePath);
//       }
//     }

//     return middleware();
//   });
// }
