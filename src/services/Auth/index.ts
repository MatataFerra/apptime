import { User } from "@prisma/client";
import { getServerSession, Session } from "next-auth";
import { signIn, signOut } from "next-auth/react";

import PasswordService from "@/services/Auth/password";
import ErrorFactory from "@/services/Error/factory";
import TokenService from "@/services/Token";
import UserService from "@/services/User";

import { authOptions } from "@/utils/auth";
import { NEXT_AUTH_SESSION_TOKEN } from "@/utils/constants";

import prisma from "#/prisma/client";

type SessionStorage = Session & {
  accessToken: unknown;
};
interface AuthServiceInterface {
  user: Omit<User, "id">;
  session?: SessionStorage;
  login(type_account: string, callbackUrl: string): Promise<void>;
  register(user: Omit<User, "id">): Promise<User>;
}

/** Authentication service
 * - [ ] Forgot Password
 * @description This service is responsible for handling all authentication related operations
 * @class Auth
 * @implements {AuthServiceInterface}
 * @param {Omit<User, "id">} user
 * @method login
 * @method register
 * @method getSession
 * @method logout
 * @method oauthUser
 */
class Auth implements AuthServiceInterface {
  user: Omit<User, "id">;
  constructor(user: Omit<User, "id">) {
    this.user = user;
  }

  static async getSession() {
    const session = await getServerSession(authOptions);

    if (!session) return null;

    return session;
  }

  async login(type_account: string, callbackUrl: string = "/") {
    await signIn(type_account, {
      callbackUrl,
    });
  }

  static logout() {
    signOut();
  }

  async register(): Promise<User> {
    // check if user already exists
    const user = await UserService.findUniqueUser({ email: this.user.email });

    if (user) {
      throw ErrorFactory.createError("UserAlreadyExists");
    }

    if (!this.user.password) {
      throw ErrorFactory.createError("PasswordIsNotValid", {
        error: "Password doesn't provided",
      });
    }

    // validate and hash password
    const isValidPassword = new PasswordService(this.user.password).validPassword();

    if (!isValidPassword.valid) {
      throw ErrorFactory.createError("PasswordIsNotValid", {
        error: isValidPassword.errors,
      });
    }
    const password = await PasswordService.hashPassword(isValidPassword.password);

    // create user
    const newUser = await new UserService({
      ...this.user,
      password,
      email: this.user.email,
      type_account: "CREDENTIALS",
      name: this.user.name,
    }).createUser();

    return newUser;
  }

  static async oauthUser(body: { email: string; name: string; image: string }) {
    if (!body.email || !body.name || !body.image) {
      throw ErrorFactory.createError("BodyNotProvided");
    }

    const token = await new TokenService(NEXT_AUTH_SESSION_TOKEN).decodedCookieData();

    if (!token) return null;
    const user = await UserService.findUniqueUser({ email: token.email });

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
}

export default Auth;
