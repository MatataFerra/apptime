import Password from "@/services/Auth/password";

import { PassedErrors } from "@/types";

/** Which password rules are still failing, derived from the current value. */
function usePasswordErrors(password: string) {
  const { errors, valid } = new Password(password).validPassword();

  const passedErrors: PassedErrors = {
    CAPITAL_LETTER: !!errors.CAPITAL_LETTER?.code,
    MIN_LENGTH: !!errors.MIN_LENGTH?.code,
    ONE_NUMBER: !!errors.ONE_NUMBER?.code,
    SPECIAL_CHAR: !!errors.SPECIAL_CHAR?.code,
  };

  return { passedErrors, isValid: valid };
}

export default usePasswordErrors;
