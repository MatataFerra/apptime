import { Profile, Shift, User } from "@prisma/client";

import TokenService from "@/services/Token";

import { USER_ROLES } from "@/utils/constants";

import prisma from "#/prisma/client";

type FindUniqueUserType = {
  id?: string | null;
  email?: string | null;
};

interface UserWithProfileAndShifts extends User {
  profile: Profile | null;
  shifts: Shift[];
}

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

  static async findUniqueUser(options: FindUniqueUserType): Promise<User | null> {
    let fieldSelected: "id" | "email" = "email";
    if (options.id) fieldSelected = "id";
    if (options.email) fieldSelected = "email";

    const user = await prisma.user.findUnique({
      where: {
        [fieldSelected]: options[fieldSelected],
      },
    });

    return user;
  }

  static async filterUserProps(
    user: User | Partial<UserWithProfileAndShifts>,
    params: (string | null)[]
  ) {
    if (!user) return null;
    if (!params) return user;

    return Object.keys(user).reduce((acc, current) => {
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
    const cookie = TokenService.getCookie();
    const token = await new TokenService(cookie).decodedCookieData();

    if (!token) return null;

    const user = await UserService.findUniqueUser({ email: token.email });

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

  isAdmin(): boolean {
    return this.user.role === USER_ROLES.ADMIN;
  }
}

export default UserService;
