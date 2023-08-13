import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import TokenService from "./services/Token";
import ut from "./services/Utilities";
import { USER_ROLES } from "./utils/constants";
import { PATH_NAMES } from "./utils/constants/pathnames";
import i18n from "./services/i18n";

export default withAuth(async function middleware(req) {
  const nextPathName = req.nextUrl.pathname;
  const I18N = new i18n("en");
  const locale = I18N.getLocale(req);

  const pathnameIsMissingLocale = i18n.isMissingLocale(nextPathName);

  if (pathnameIsMissingLocale) {
    const pathname = `/${locale}${nextPathName.startsWith("/") ? "" : "/"}${nextPathName}`;
    // e.g. incoming request is /products
    // The new URL is now /en-US/products
    ut.redirect(req, pathname);
  }

  if (nextPathName === PATH_NAMES.ADMIN) {
    const cookie = req.cookies.get("next-auth.session-token");
    const token = await new TokenService(cookie).decodedCookieData();

    if (token?.role !== USER_ROLES.ADMIN) ut.redirect(req, PATH_NAMES.HOME);

    NextResponse.next();
  }

  if (nextPathName === PATH_NAMES.HOME) {
    const parsedPath = i18n.parsePathname(PATH_NAMES.NO_MOBILE, locale);
    const headers = new Headers(req.headers).get("user-agent") ?? "";

    if (!ut.isMobile(headers)) {
      return ut.redirect(req, parsedPath);
    }
  }

  if (nextPathName === PATH_NAMES.NO_MOBILE) {
    const headers = new Headers(req.headers).get("user-agent") ?? "";
    const parsedPath = i18n.parsePathname(PATH_NAMES.HOME, locale);

    if (ut.isMobile(headers)) {
      return ut.redirect(req, parsedPath);
    }
  }
});

export const config = { matcher: ["/", "/admin", "/no-mobile"] };
