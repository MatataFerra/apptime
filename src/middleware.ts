import { withAuth } from "next-auth/middleware";
import { NextRequest, NextResponse } from "next/server";
import TokenService from "./services/Token";
import ut from "./services/Utilities";
import { USER_ROLES } from "./utils/constants";
import { match as matchLocale } from '@formatjs/intl-localematcher'
import Negotiator from 'negotiator'
import { i18n } from "#/i18n/i18n-config";
import { PATH_NAMES } from "./utils/constants/pathnames";

function getLocale(request: NextRequest): string | undefined {
  // Negotiator expects plain object so we need to transform headers
  const negotiatorHeaders: Record<string, string> = {}
  request.headers.forEach((value, key) => (negotiatorHeaders[key] = value))

  // @ts-ignore locales are readonly
  const locales: string[] = i18n.locales

  // Use negotiator and intl-localematcher to get best locale
  let languages = new Negotiator({ headers: negotiatorHeaders }).languages(
    locales
  )

  const locale = matchLocale(languages, locales, i18n.defaultLocale)

  return locale
}



export default withAuth(async function middleware(req) {
  const pathname = req.nextUrl.pathname

  const pathnameIsMissingLocale = i18n.locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  )

  if (pathnameIsMissingLocale) {
    const locale = getLocale(req)
    // e.g. incoming request is /products
    // The new URL is now /en-US/products
    return ut.redirect(req, `/${locale}${pathname.startsWith('/') ? '' : '/'}${pathname}`)
    
  }


  if (pathname === PATH_NAMES.ADMIN) {
    const cookie = req.cookies.get("next-auth.session-token");
    const token = await new TokenService(cookie).decodedCookieData();

    if (token?.role !== USER_ROLES.ADMIN) ut.redirect(req, "/protected");

    NextResponse.next();
  }

  if (pathname === PATH_NAMES.HOME) {
    const headers = new Headers(req.headers).get("user-agent") ?? "";

    if (!ut.isMobile(headers)) {
      return ut.redirect(req, PATH_NAMES.NO_MOBILE);
    }
  }

  if (pathname === PATH_NAMES.NO_MOBILE) {
    const headers = new Headers(req.headers).get("user-agent") ?? "";
    if (ut.isMobile(headers)) {
      return ut.redirect(req, PATH_NAMES.HOME);
    }
  }
});


export const config = { matcher: ["/", "/admin", "/no-mobile"] };
