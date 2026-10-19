import { NextRequest, NextResponse } from "next/server";

import i18n from "@/services/i18n";
import Router from "@/services/Router";
import TokenService from "@/services/Token";
import ut from "@/services/Utilities";

import { NEXT_AUTH_SESSION_TOKEN, USER_ROLES } from "@/utils/constants";
import { PATH_NAMES } from "@/utils/constants/pathnames";

const PRIVATES_ROUTES = [
  "/dashboard",
  "/settings",
  "/fast-charge",
  "/track",
  "/production",
  "/admin",
];

const LOGGED_ROUTES = ["/forgot-password", "/reset", "/success"];

export default async function proxy(req: NextRequest) {
  const nextPathName = req.nextUrl.pathname;
  const I18N = new i18n("en");
  // The URL's locale wins; the browser language only fills in when it's missing.
  // (Using the browser language for /es/... built /en/es/... and skipped every check.)
  const locale = Router.localeFromPath(nextPathName) ?? I18N.getLocale(req) ?? "en";
  const routeLocale = Router.addLocale(nextPathName, locale);
  const router = new Router(PRIVATES_ROUTES).addLocalesToRoutes();
  const loggedRoutes = new Router(LOGGED_ROUTES).addLocalesToRoutes();
  const token = await new TokenService(NEXT_AUTH_SESSION_TOKEN).decodedCookieData(req.cookies);

  const pathnameIsMissingLocale = Router.isMissingLocale(nextPathName);

  if (pathnameIsMissingLocale) {
    // e.g. incoming request is /products
    // The new URL is now /en-US/products;
    return ut.redirect(req, routeLocale);
  }

  // check if user is logged and redirect if try to go to logged routes
  if (loggedRoutes.isRoute(routeLocale)) {
    const noMobilePath = Router.addLocale(PATH_NAMES.NO_MOBILE, locale);

    // redirect to the no-mobile page if the user is not on a mobile device
    if (!ut.isMobile({ request: req })) {
      return ut.redirect(req, noMobilePath);
    }

    if (token) {
      const url = req.nextUrl.clone();
      const home = Router.addLocale(PATH_NAMES.HOME, locale);
      url.pathname = home;

      return NextResponse.redirect(url);
    }
  }

  // check if the route is a private route
  if (router.isRoute(routeLocale)) {
    const noMobilePath = Router.addLocale(PATH_NAMES.NO_MOBILE, locale);

    // redirect to the no-mobile page if the user is not on a mobile device
    if (!ut.isMobile({ request: req })) {
      return ut.redirect(req, noMobilePath);
    }

    // redirect to the login page if the user is not authenticated
    if (!token) {
      const url = req.nextUrl.clone();
      const login = Router.addLocale(PATH_NAMES.LOGIN, locale);
      url.pathname = login;
      url.searchParams.set("redirect", nextPathName);

      return NextResponse.redirect(url);
    }

    // check if the user is an admin
    if (Router.isRouteSupported(PATH_NAMES.ADMIN, nextPathName)) {
      if (token?.role !== USER_ROLES.ADMIN) {
        return ut.redirect(req, PATH_NAMES.HOME);
      }

      return NextResponse.next();
    }

    return NextResponse.next();
  }

  // check if the route is the no-mobile page
  if (Router.isRouteSupported(PATH_NAMES.NO_MOBILE, nextPathName)) {
    const homePath = Router.addLocale(PATH_NAMES.HOME, locale);

    // redirect to the home page if the user is on a mobile device
    if (ut.isMobile({ request: req })) {
      return ut.redirect(req, homePath);
    }
  } else {
    const noMobilePath = Router.addLocale(PATH_NAMES.NO_MOBILE, locale);

    // redirect to the no-mobile page if the user is not on a mobile device
    if (!ut.isMobile({ request: req })) {
      return ut.redirect(req, noMobilePath);
    }
  }
}

export const config = {
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
    "/forgot-password",
    "/es/forgot-password",
    "/en/forgot-password",
    "/reset",
    "/es/reset",
    "/en/reset",
    "/success",
    "/es/success",
    "/en/success",
  ],
};
