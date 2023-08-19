import { withAuth } from "next-auth/middleware";
import createIntlMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import TokenService from "./services/Token";
import ut from "./services/Utilities";
import { SUPPORTED_LOCALES, USER_ROLES } from "./utils/constants";
import { PATH_NAMES } from "./utils/constants/pathnames";
import i18n from "./services/i18n";

const locales = ["en", "es"];

const localeDefault: any = {};

const intlMiddleware = createIntlMiddleware({
  locales,
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
    const cookie = req.cookies.get("next-auth.session-token");
    const token = await new TokenService(cookie).decodedCookieData();

    if (token?.role !== USER_ROLES.ADMIN) ut.redirect(req, PATH_NAMES.HOME);

    NextResponse.next();
  }

  if (i18n.isRouteSupported(PATH_NAMES.HOME, nextPathName)) {
    const headers = new Headers(req.headers).get("user-agent") ?? "";
    const parsedPath = i18n.parsePathname(PATH_NAMES.NO_MOBILE, locale);

    if (!ut.isMobile(headers)) {
      return ut.redirect(req, parsedPath);
    }
  }

  if (i18n.isRouteSupported(PATH_NAMES.NO_MOBILE, nextPathName)) {
    const headers = new Headers(req.headers).get("user-agent") ?? "";
    const parsedPath = i18n.parsePathname(PATH_NAMES.HOME, locale);

    if (ut.isMobile(headers)) {
      return ut.redirect(req, parsedPath);
    }
  }
});

export const config = {
  matcher: [
    "/",
    "/no-mobile",
    "/admin",
    "/es/admin",
    "/es",
    "/es/no-mobile",
    "/en",
    "/en/no-mobile",
    "/en/admin",
  ],
};
