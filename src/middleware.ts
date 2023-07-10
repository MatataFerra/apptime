import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import TokenService from "./services/Token/index";
import { USER_ROLES } from "./utils/constants";

export default withAuth(async function middleware(req) {
  if (req.nextUrl.pathname === "/admin") {
    const cookie = req.cookies.get("next-auth.session-token");
    const token = await new TokenService(cookie).decodedCookieData();

    if (token?.role !== USER_ROLES.ADMIN) {
      const url = req.nextUrl.clone();
      url.pathname = "/protected";
      return NextResponse.redirect(url);
    }

    NextResponse.next();
  }
});

export const config = { matcher: ["/protected", "/admin"] };
