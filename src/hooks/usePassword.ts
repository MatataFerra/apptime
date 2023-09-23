import { useEffect, useState } from "react";

import Password from "@/services/Auth/password";

import { PassedErrors } from "@/types";

function usePassword(password: string) {
  const [passedErrors, setPassedErrors] = useState<PassedErrors>({
    CAPITAL_LETTER: false,
    MIN_LENGTH: false,
    ONE_NUMBER: false,
    SPECIAL_CHAR: false,
  });

  useEffect(() => {
    const { errors } = new Password(password).validPassword();

    setPassedErrors((prev) => ({
      ...prev,
      CAPITAL_LETTER: !!errors.capital?.code,
      MIN_LENGTH: !!errors.len?.code,
      ONE_NUMBER: !!errors.number?.code,
      SPECIAL_CHAR: !!errors.specialChar?.code,
    }));
  }, [password]);

  return passedErrors;
}

export default usePassword;
