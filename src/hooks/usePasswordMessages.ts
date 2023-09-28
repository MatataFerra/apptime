import { useMemo } from "react";
import { FieldErrors } from "react-hook-form";

import { PassedErrors } from "@/types";

interface LoginInputs {
  email: string;
  password: string;
}

function usePasswordMessages(errors: FieldErrors<LoginInputs>) {
  const parseErrors = useMemo(() => {
    if (errors?.password?.message) {
      const errorToParse = errors?.password?.message as unknown as PassedErrors;
      const parsed = JSON.parse(errorToParse as unknown as string) as PassedErrors;

      return parsed;
    }
  }, [errors?.password?.message]);

  return parseErrors;
}

export default usePasswordMessages;
