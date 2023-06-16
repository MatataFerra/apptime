import prisma from "#/prisma/client";
import _ from "lodash";
import bcrypt from "bcryptjs";
import { UserService, ErrorFactory } from "@/services";

/**
 * Password class
 * @param password - Password
 */
export default class Password {
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

  isValid(): { valid: boolean; error?: string } {
    if (!this._hasOneCapital()) {
      return {
        valid: false,
        error: "Password must have at least one capital letter",
      };
    }
    if (!this._hasOneNumber()) {
      return {
        valid: false,
        error: "Password must have at least one number",
      };
    }

    if (!this._hasCorrectLenght()) {
      return {
        valid: false,
        error: "Password must have at least 8 characters",
      };
    }

    if (!this._hasOneSpecialCharacter()) {
      return {
        valid: false,
        error: "Password must have at least one special character",
      };
    }

    return {
      valid: true,
    };
  }

  static validatePassword(password: string): {
    valid: boolean;
    error?: string;
    password: string;
  } {
    const isValidPassword = new Password(password).isValid();
    if (!isValidPassword.valid) {
      return {
        valid: false,
        password,
        error: isValidPassword.error,
      };
    }

    return { ...isValidPassword, password };
  }

  static async hashPassword(password: string) {
    return await bcrypt.hash(password, 10);
  }

  static async comparePassword(
    password: string,
    hash: string
  ): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }

  isSamePassword(password: string, confirmPassword: string): boolean {
    return _.isEqual(password, confirmPassword);
  }
}
