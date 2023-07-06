import { User } from "@prisma/client";
import prisma from "#/prisma/client";
import { AuthService, ErrorFactory } from "@/services";

type FindUniqueUserType = {
  id?: string;
  email?: string;
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

  static async findUniqueUser(
    options: FindUniqueUserType
  ): Promise<User | null> {
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

  static async authenticatedUser() {
    const token = await AuthService.decodedCookieData();
    if (!token) return null;
    return await this.findUniqueUser({ email: token.email });
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
}

export default UserService;
