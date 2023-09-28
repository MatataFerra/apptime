import { useEffect, useState } from "react";

import Password from "@/services/Auth/password";

import { PassedErrors } from "@/types";

function usePasswordErrors(password: string) {
  const [passedErrors, setPassedErrors] = useState<PassedErrors>({
    CAPITAL_LETTER: false,
    MIN_LENGTH: false,
    ONE_NUMBER: false,
    SPECIAL_CHAR: false,
  });
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    const { errors, valid } = new Password(password).validPassword();

    setIsValid(valid);

    setPassedErrors((prev) => ({
      ...prev,
      CAPITAL_LETTER: !!errors.capital?.code,
      MIN_LENGTH: !!errors.len?.code,
      ONE_NUMBER: !!errors.number?.code,
      SPECIAL_CHAR: !!errors.specialChar?.code,
    }));
  }, [password]);

  return { passedErrors, isValid };
}

export default usePasswordErrors;
