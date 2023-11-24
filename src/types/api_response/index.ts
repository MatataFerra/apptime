import { User } from "@prisma/client";

import { HandleErrorType } from "@/types/services";

export type FailureApiResponse = {
  error: {
    cause: string;
    fields: any[];
    message: string;
    response: boolean;
    type_error: HandleErrorType;
  };

  response?: boolean;
};

export type SuccessUserApiResponse = {
  message: string;
  response: boolean;
  user: User;
};
