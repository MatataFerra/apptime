import { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { cookies as cookieStore } from "next/headers";
import { decode } from "next-auth/jwt";

import { JWTDecodedType } from "@/types";

interface TokenServiceInterface {
  cookie: RequestCookie | undefined;
  decodedCookieData(): Promise<JWTDecodedType | null>;
}

/**
 * @class TokenService
 * @description This class is responsible for all the logic related to the Token model
 * @param {RequestCookie} cookie - The cookie object.
 *
 * @method decodedCookieData - This method is responsible for decoding the cookie data
 * @method getCookie - This static method is responsible for getting the cookie
 *
 */

class TokenService implements TokenServiceInterface {
  cookie: RequestCookie | undefined;
  constructor(cookie: RequestCookie | undefined) {
    this.cookie = cookie;
  }
  async decodedCookieData(): Promise<JWTDecodedType | null> {
    if (!this.cookie) return null;

    const result = (await decode({
      token: this.cookie.value,
      secret: process.env.NEXTAUTH_SECRET,
    })) as JWTDecodedType;

    return result;
  }

  static getCookie(cookie = "next-auth.session-token") {
    const getCookie = cookieStore().get(cookie);
    return getCookie;
  }
}

export default TokenService;
