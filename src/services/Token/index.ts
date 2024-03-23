import { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { cookies as cookieStore } from "next/headers";
import { decode, encode } from "next-auth/jwt";

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

/**
 * @class Token Service
 * @description This class is responsible for all the logic related to the Token model based on Builder pattern
 * @param {string} cookie - The cookie that the user wants to get.
 *
 * @returns {Token} - Returns the token
 *
 */
export class Token {
  cookie: string;
  session: {
    cookie: RequestCookie | undefined;
    token: JWTDecodedType | null;
  };
  constructor(cookie: string = "next-auth.session-token") {
    this.cookie = cookie;
    this.session = {
      cookie: undefined,
      token: null,
    };
  }

  private async decodedCookieData() {
    if (!this.session || !this.session.cookie) return this;

    const result = (await decode({
      token: this.session.cookie.value,
      secret: process.env.NEXTAUTH_SECRET,
    })) as JWTDecodedType;

    this.session.token = result;

    return this;
  }

  private async getCookie() {
    const getCookie = cookieStore().get(this.cookie);
    this.session.cookie = getCookie || undefined;
    return this;
  }

  async build() {
    await this.getCookie();
    await this.decodedCookieData();

    return this.session.token;
  }
}

export default TokenService;
