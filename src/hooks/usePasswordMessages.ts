import { useMemo } from "react";
import { FieldErrors } from "react-hook-form";

import { PassedErrors } from "@/types";

interface Inputs {
  password: string;
}

function usePasswordMessages<T extends Inputs>(errors: FieldErrors<T>) {
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
