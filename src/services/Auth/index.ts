import { UserType } from "@/types/services";
import { signIn, signOut } from "next-auth/react";
import { cookies as cookieStore } from "next/headers";
import prisma from "#/prisma/client";
import { User } from "@prisma/client";
import { Session, getServerSession } from "next-auth";
import { JWT, decode } from "next-auth/jwt";
import jwt from "jsonwebtoken";
import { ErrorFactory, UserService, PasswordService } from "@/services";
import { UserCreateSchema } from "@/types";
import { authOptions } from "@/utils/auth";

export interface JWTDecodedType extends JWT {
  accessToken: string;
  email: string;
  name: string;
  image: string;
}

type SessionStorage = Session & {
  accessToken: unknown;
};
interface AuthServiceInterface {
  user?: Omit<User, "id">;
  session?: SessionStorage;
  // oauthUser(body: {
  //   email: string;
  //   name: string;
  //   image: string;
  // }): Promise<User>;
  // decodedCookieData(): Promise<JWTDecodedType | null>;
  login(type_account: string, callbackUrl: string): Promise<void>;
  logout(): Promise<void>;
  // register(user: User): Promise<User>;
  isValidToken(token: string): Promise<boolean>;
}

/** Authentication service
 * - [ ] Forgot Password
 */
class Auth implements AuthServiceInterface {
  constructor() {}

  static async getSession() {
    const session = await getServerSession(authOptions);

    if (!session) return null;

    return session;
  }

  static async decodedCookieData(): Promise<JWTDecodedType | null> {
    const token = cookieStore().get("next-auth.session-token");

    if (!token) return null;

    const result = (await decode({
      token: token.value,
      secret: process.env.NEXTAUTH_SECRET,
    })) as JWTDecodedType;

    return result;
  }

  async login(type_account: string, callbackUrl: string = "/") {
    await signIn(type_account, {
      callbackUrl,
    });
  }

  async logout() {
    await signOut();
  }

  static async register(user: Omit<User, "id">) {
    const userSchema = UserCreateSchema.safeParse(user);

    if (!userSchema.success) {
      return ErrorFactory.createError("BodyNotProvided");
    }

    const newUser: Omit<User, "id"> = await UserService.createUser({
      ...userSchema.data,
      password: userSchema.data.password,
      email: userSchema.data.email,
      type_account: "CREDENTIALS",
      name: userSchema.data.name,
    });

    return newUser;
  }

  static async oauthUser(body: { email: string; name: string; image: string }) {
    if (!body.email || !body.name || !body.image) {
      return ErrorFactory.createError("BodyNotProvided");
    }

    const user = await UserService.authenticatedUser();
    if (!user) {
      return await prisma.user.create({
        data: {
          email: body.email,
          name: body.name,
          image: body.image,
          type_account: "OAUTH",
        },
      });
    }

    return user;
  }

  isValidToken(token: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      jwt.verify(token, process.env.NEXTAUTH_SECRET, (err) => {
        if (err) {
          return reject(err);
        }
        return resolve(true);
      });
    });
  }
}

export default Auth;
