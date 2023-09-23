import Password from "@/services/Auth/password";

import { PASSWORD_CODE_ERRORS, PASSWORD_MESSAGE_ERROR } from "@/utils/constants";

describe("Password service", () => {
  test("Should add specialChar error code", () => {
    const password = "45Akjdfkgdfg";
    const validatePassword = new Password(password).validPassword();

    const expectedObj = {
      errors: {
        specialChar: {
          code: PASSWORD_CODE_ERRORS.SPECIAL_CHAR,
          message: PASSWORD_MESSAGE_ERROR.SPECIAL_CHAR,
        },
      },
      valid: false,
      password,
    };
    expect(validatePassword).toEqual(expectedObj);
  });
});
