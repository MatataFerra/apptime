import { User } from "@prisma/client";
import prisma from "#/prisma/client";
import { AuthService, ErrorFactory } from "@/services";

/**
 * @class UserService
 * @description This class is responsible for all the logic related to the User model
 * @param {UserType} user - The user object.
 */

class UserService {
  user: User;
  constructor(user: User) {
    this.user = user;
  }

  static async findUniqueUserByEmail(email: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    return user;
  }

  static async authenticatedUser() {
    const token = await AuthService.decodedCookieData();
    if (!token) return null;
    return await this.findUniqueUserByEmail(token.email);
  }

  static async createUser(user: Omit<User, "id">) {
    return await prisma.user.create({
      data: {
        ...user,
        email: user.email,
        password: user.password,
        name: user.name,
        type_account: user.type_account,
      },
    });
  }
}

export default UserService;
