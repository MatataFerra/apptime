import Password from "@/services/Auth/password";

import { PASSWORD } from "@/utils/constants";

describe("Password service", () => {
  test("Should add specialChar error code", () => {
    const password = "45Akjdfkgdfg";
    const validatePassword = new Password(password).validPassword();

    const expectedObj = {
      errors: {
        SPECIAL_CHAR: {
          code: PASSWORD.PASSWORD_CODE_ERRORS.SPECIAL_CHAR,
          message: PASSWORD.PASSWORD_MESSAGE_ERROR.SPECIAL_CHAR,
        },
      },
      valid: false,
      password,
    };
    expect(validatePassword).toEqual(expectedObj);
  });
});
