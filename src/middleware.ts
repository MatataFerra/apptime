import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import TokenService from "./services/Token";
import ut from "./services/Utilities";
import { USER_ROLES } from "./utils/constants";

export default withAuth(async function middleware(req) {
  if (req.nextUrl.pathname === "/admin") {
    const cookie = req.cookies.get("next-auth.session-token");
    const token = await new TokenService(cookie).decodedCookieData();

    if (token?.role !== USER_ROLES.ADMIN) ut.redirect(req, "/protected");

    NextResponse.next();
  }

  if (req.nextUrl.pathname === "/") {
    const headers = new Headers(req.headers).get("user-agent") ?? "";

    if (!ut.isMobile(headers)) {
      return ut.redirect(req, "/no-mobile");
    }
  }

  if (req.nextUrl.pathname === "/no-mobile") {
    const headers = new Headers(req.headers).get("user-agent") ?? "";
    if (ut.isMobile(headers)) {
      return ut.redirect(req, "/");
    }
  }
});

export const config = { matcher: ["/protected", "/admin", "/", "/no-mobile"] };
