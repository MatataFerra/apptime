import { now } from "@/utils/constants";
import { addMinutes } from "date-fns";
import prisma from "#/prisma/client";
import { AuthService, UserService } from "..";

const authService = new AuthService();

/**
 * Password class
 * @param password - Password
 */
class Password {
  password: string;
  constructor(password: string) {
    this.password = password;
  }

  private _hasOneCapital() {
    return /[A-Z]/.test(this.password);
  }

  private _hasOneNumber() {
    return /[0-9]/.test(this.password);
  }

  private _hasCorrectLenght() {
    return this.password.length >= 8;
  }

  private _hasOneSpecialCharacter() {
    return /[^A-Za-z0-9]/.test(this.password);
  }

  async maxAttemps(max: number) {
    const user = await UserService.authenticatedUser();
    const maxAttemps = await prisma.passwordAttemps.findFirst({
      where: {
        userId: user?.id,
      },
    });
  }

  isValid() {
    return (
      this._hasOneCapital() &&
      this._hasOneNumber() &&
      this._hasCorrectLenght() &&
      this._hasOneSpecialCharacter()
    );
  }
}
