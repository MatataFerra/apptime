import { signIn, signOut } from "next-auth/react";
import prisma from "#/prisma/client";
import { User } from "@prisma/client";
import { Session, getServerSession } from "next-auth";
import jwt from "jsonwebtoken";
import { ErrorFactory, UserService, PasswordService } from "@/services";
import { authOptions } from "@/utils/auth";

type SessionStorage = Session & {
  accessToken: unknown;
};
interface AuthServiceInterface {
  user: Omit<User, "id">;
  session?: SessionStorage;
  login(type_account: string, callbackUrl: string): Promise<void>;
  logout(): Promise<void>;
  register(user: Omit<User, "id">): Promise<User>;
  isValidToken(token: string): Promise<boolean>;
}

/** Authentication service
 * - [ ] Forgot Password
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

  async logout() {
    await signOut();
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
    const isValidPassword = PasswordService.validatePassword(
      this.user.password
    );

    if (!isValidPassword.valid) {
      throw ErrorFactory.createError("PasswordIsNotValid", {
        error: isValidPassword.error,
      });
    }
    const password = await PasswordService.hashPassword(
      isValidPassword.password
    );

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
