import { NextRequest, NextResponse } from "next/server";

import i18n from "@/services/i18n";
import { decideAccess, localeOf } from "@/services/Router/access";
import ut from "@/services/Utilities";

import { auth } from "@/utils/auth";

/**
 * Locale, mobile-only and sign-in checks for every page. Which page needs
 * what lives in ROUTE_RULES (services/Router/access.ts); API routes check
 * the session themselves.
 */
export default async function proxy(req: NextRequest) {
  const decision = await decideAccess({
    pathname: req.nextUrl.pathname,
    preferredLocale: new i18n("en").getLocale(req) ?? "en",
    isMobile: ut.isMobile({ request: req }),
    // Proxy runs on Node in Next 16, so it can read the Better Auth session
    // (from the signed cookie cache; the database only every few minutes).
    getUser: async () =>
      (await auth.api.getSession({ headers: req.headers }).catch(() => null))?.user ?? null,
  });

  if (decision.type === "next") {
    // next-intl reads the locale of server components and server actions
    // from this header (its own middleware would set it; this proxy does).
    const headers = new Headers(req.headers);
    const locale = localeOf(req.nextUrl.pathname);
    if (locale) headers.set("X-NEXT-INTL-LOCALE", locale);
    return NextResponse.next({ request: { headers } });
  }

  const url = req.nextUrl.clone();
  url.pathname = decision.pathname;
  if (decision.redirectBack) url.searchParams.set("redirect", decision.redirectBack);
  return NextResponse.redirect(url);
}

export const config = {
  // Every page. Not API routes (they check the session themselves), Next's
  // assets, Vercel's scripts, or files with an extension (icons, images).
  // Must be a literal: Next reads it at build time.
  matcher: ["/((?!api/|_next/|_vercel/|.*\\.[^/]+$).*)"],
};
