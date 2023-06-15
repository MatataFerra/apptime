import { UserType } from "@/types/services";
import { Shift } from "@prisma/client";
import ShiftService from "../Shift";
import prisma from "#/prisma/client";
import { AuthService } from "@/services";

/**
 * @class UserService
 * @description This class is responsible for all the logic related to the User model
 * @method transformUser - Transforms the user object
 * @param {UserType} user - The user object.
 */

class UserService {
  user: UserType;
  constructor(user: UserType) {
    this.user = user;
  }

  transformUser(user: UserType): UserType {
    const amount: Shift[] = user.shifts.map((shift) => ({
      ...shift,
      amount: ShiftService.differenceBetweenStartAndEnd(shift),
    }));

    const userTransformed: UserType = {
      ...this.user,
      shifts: amount,
    };

    return userTransformed;
  }

  static async authenticatedUser() {
    const token = await AuthService.decodedCookieData();
    return await prisma.user.findUnique({
      where: {
        email: token?.email,
      },
    });
  }
}

export default UserService;
