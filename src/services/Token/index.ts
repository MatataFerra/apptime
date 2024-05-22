import { cookies as cookieStore } from "next/headers";
import { decode, encode } from "next-auth/jwt";

import { JWTDecodedType } from "@/types";

import { NEXT_AUTH_SESSION_TOKEN } from "@/utils/constants";

interface TokenServiceInterface {
  cookie: string;
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
  cookie: string;
  constructor(cookie: string) {
    this.cookie = cookie;
  }
  async decodedCookieData(): Promise<JWTDecodedType | null> {
    if (!this.cookie) return null;

    const cookie = this.getCookie();

    const result = (await decode({
      token: cookie?.value ?? "",
      secret: process.env.NEXTAUTH_SECRET,
    })) as JWTDecodedType;

    return result;
  }

  getCookie() {
    const cookie = cookieStore().get(this.cookie);

    if (!cookie) return cookieStore().get(NEXT_AUTH_SESSION_TOKEN);

    return cookie;
  }

  static async createToken(data: { email: string; name: string; picture: string; sub: string }) {
    const token = await encode({
      token: {
        ...data,
      },
      secret: process.env.NEXTAUTH_SECRET,
    });

    return token;
  }
}

export default TokenService;
