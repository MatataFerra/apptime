import { HandlerErrorTypes, InterfaceConfig } from "@/types/services";

export const EXCEPTIONS: Record<HandlerErrorTypes, InterfaceConfig["config"]> =
  {
    UserNotFound: {
      message: "User not found",
      cause: "The user does not exist in the database",
      type_error: "UserNotFound",
    },
    UserAlreadyExists: {
      message: "User already exists",
      cause: "The user already exists in the database, try another email",
      type_error: "UserAlreadyExists",
    },
  };
