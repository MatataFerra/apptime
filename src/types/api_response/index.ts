import { User } from "@prisma/client";

import { HandleErrorType } from "@/types/services";

export type ApiResponse<T> = SuccessApiResponse<T> | FailureApiResponse;

type SuccessApiResponse<T> = {
  [key: string]: {
    [k in keyof T]: T[k];
  };
} & {
  response: true;
  message: string;
};

export interface FailureApiResponse {
  error: {
    cause: string;
    fields: any[];
    message: string;
    response: boolean;
    type_error: HandleErrorType;
  };

  response?: false;
}

export interface SuccessUserApiResponse extends Response {
  message: string;
  response: boolean;
  user: User;
}
