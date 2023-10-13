import bcrypt from "bcryptjs";
import { isEmpty, isEqual } from "lodash";

import { PASSWORD } from "@/utils/constants";

type ErrorCodeType = {
  errors: {
    CAPITAL_LETTER: {
      code: number;
      message: string;
    };

    MIN_LENGTH: {
      code: number;
      message: string;
    };

    ONE_NUMBER: {
      code: number;
      message: string;
    };

    SPECIAL_CHAR: {
      code: number;
      message: string;
    };
  };

  valid: boolean;
};

/**
 * Password class
 * @param password - Password
 * @description This class is responsible for all the logic related to the Password
 * model
 * @returns {Object} - Returns an object with the password and the methods
 * isValid and maxAttemps
 * @method isValid - Checks if the password is valid
 * @returns {Object} { valid: Boolean, error: String } - Returns an object with the valid property and the error
 *
 *
 */
class Password {
  password: string;
  validations: ErrorCodeType;
  constructor(password: string) {
    this.password = password;
    this.validations = {
      errors: {} as ErrorCodeType["errors"],
      valid: false,
    };
  }

  addCode(type: string, code: keyof typeof PASSWORD.PASSWORD_CODE_ERRORS) {
    this.validations.errors = {
      ...this.validations.errors,
      [type]: {
        code: PASSWORD.PASSWORD_CODE_ERRORS[code],
        message: this.getErrorMessages(code),
      },
    };

    return this.validations;
  }

  private _hasOneCapital() {
    return /[A-Z]/.test(this.password);
  }

  private _hasOneNumber() {
    return /[0-9]/.test(this.password);
  }

  private _hasCorrectLenght() {
    return this.password?.length >= 8;
  }

  private _hasOneSpecialCharacter() {
    return /[^A-Za-z0-9]/.test(this.password);
  }

  getErrorMessages(code: keyof typeof PASSWORD.PASSWORD_MESSAGE_ERROR) {
    return PASSWORD.PASSWORD_MESSAGE_ERROR[code];
  }

  private runValidations() {
    if (!this._hasOneCapital()) {
      this.addCode("CAPITAL_LETTER", "CAPITAL_LETTER");
    }
    if (!this._hasOneNumber()) {
      this.addCode("ONE_NUMBER", "ONE_NUMBER");
    }

    if (!this._hasCorrectLenght()) {
      this.addCode("MIN_LENGTH", "MIN_LENGTH");
    }

    if (!this._hasOneSpecialCharacter()) {
      this.addCode("SPECIAL_CHAR", "SPECIAL_CHAR");
    }

    return {
      ...this.validations,
      valid: isEmpty(this.validations.errors),
      password: this.password,
    };
  }

  private isValid() {
    return this.runValidations();
  }

  public static validatePassword(password: string) {
    const isValidPassword = new Password(password).isValid();
    if (!isValidPassword.valid) {
      return isValidPassword;
    }

    return { ...isValidPassword, password };
  }

  validPassword() {
    return this.isValid();
  }

  static async hashPassword(password: string) {
    return await bcrypt.hash(password, 10);
  }

  static async comparePassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }

  isSamePassword(password: string, confirmPassword: string): boolean {
    return isEqual(password, confirmPassword);
  }
}

export default Password;
