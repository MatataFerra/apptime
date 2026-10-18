import { User } from "@prisma/client";
import jwt from "jsonwebtoken";
import { cookies as cookieStore } from "next/headers";
import { decode, encode } from "next-auth/jwt";

import { JWTDecodedType } from "@/types";

import { NEXT_AUTH_SESSION_TOKEN } from "@/utils/constants";

type CookieSource = { get(name: string): { value: string } | undefined };

interface TokenServiceInterface {
  cookie: string;
  decodedCookieData(source?: CookieSource): Promise<JWTDecodedType | null>;
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
  /**
   * Decodes the session cookie. Pass `req.cookies` from the proxy;
   * elsewhere it reads the request cookies from `next/headers`.
   */
  async decodedCookieData(source?: CookieSource): Promise<JWTDecodedType | null> {
    if (!this.cookie) return null;

    const cookie = await this.getCookie(source);

    const result = (await decode({
      token: cookie?.value ?? "",
      secret: process.env.NEXTAUTH_SECRET as string,
    })) as JWTDecodedType;

    return result;
  }

  async getCookie(source?: CookieSource) {
    const store = source ?? (await cookieStore());
    return store.get(this.cookie) ?? store.get(NEXT_AUTH_SESSION_TOKEN);
  }

  static async createToken(data: { email: string; name: string; picture: string; sub: string }) {
    const token = await encode({
      token: {
        ...data,
      },
      secret: process.env.NEXTAUTH_SECRET as string,
    });

    return token;
  }

  static creatSha256Token(data: User): string {
    const token = jwt.sign(data, process.env.JWT_SECRET);

    return token;
  }
}

export default TokenService;
