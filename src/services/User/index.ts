import { User } from "@prisma/client";
import { getServerSession } from "next-auth";

import TokenService from "@/services/Token";

import { UserType } from "@/types";

import { USER_ROLES } from "@/utils/constants";

import prisma from "#/prisma/client";

type FindUniqueUserType = {
  id?: string;
  email?: string;
  profile?: boolean;
  shifts?: boolean;
};

/**
 * @class UserService
 * @description This class is responsible for all the logic related to the User model
 * @param {UserType} user - The user object.
 */

class UserService {
  user: Omit<User, "id">;
  constructor(user: Omit<User, "id">) {
    this.user = user;
  }

  static async findUniqueUser(options: FindUniqueUserType): Promise<UserType | null> {
    if (!options) return null;

    const user = await prisma.user.findUnique({
      where: {
        email: options.email,
        id: options.id,
      },
      select: {
        id: true,
        email: true,
        name: true,
        type_account: true,
        role: true,
        shifts: options.shifts,
        profile: options.profile,
        emailVerified: true,
        formCompleted: true,
        image: true,
        isActive: true,
        online: true,
        passwordAttemps: true,
        password: true,
      },
    });

    return user;
  }

  static async removeProps(user: User | Partial<UserType>, params: string | string[]) {
    if (!user) return null;
    if (!params) return user;

    return Object.keys(user).reduce((acc, current) => {
      if (!params.includes(current)) {
        return {
          ...acc,
          [current]: user[current as keyof typeof user],
        };
      }

      return acc;
    }, {});
  }

  static async filterUserProps(user: User | Partial<UserType>, params: (string | null)[]) {
    if (!user) return null;
    if (!params) return user;

    return Object.keys(user).reduce((acc, current) => {
      if (current === "shifts" || current === "profile") {
        return {
          ...acc,
          [current]: user[current as keyof typeof user],
        };
      }

      if (params.includes(current)) {
        return {
          ...acc,
          [current]: user[current as keyof typeof user],
        };
      }

      return acc;
    }, {});
  }

  static async authenticatedUser() {
    const token = await new TokenService("next-auth.session-token").decodedCookieData();

    if (!token) return null;

    const user = await UserService.findUniqueUser({ email: token.email });

    return user;
  }

  static async getSessionUser() {
    const session = await getServerSession();
    const user = await UserService.findUniqueUser({
      email: session?.user?.email ?? "",
      shifts: true,
      profile: true,
    });

    return user;
  }

  async createUser() {
    return await prisma.user.create({
      data: {
        ...this.user,
        email: this.user.email,
        password: this.user.password,
        name: this.user.name,
        type_account: this.user.type_account,
      },
    });
  }

  static async updateUser({ id, user }: { id: string; user: Partial<User> }) {
    return await prisma.user.update({
      where: {
        id,
      },
      data: {
        ...user,
      },
    });
  }

  isAdmin(): boolean {
    return this.user.role === USER_ROLES.ADMIN;
  }
}

export default UserService;
