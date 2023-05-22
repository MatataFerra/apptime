import { HandleErrorTypes, InterfaceConfig } from "@/types/services";
import { z } from "zod";

export const EXCEPTIONS: Record<HandleErrorTypes, InterfaceConfig["config"]> = {
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

/**
 * @description Enum to handle errors
 * @example  const error = new ErrorService("UserNotFound");
 *
 */
export const HandleErrorTypesSchema = z.enum([
  "UserNotFound",
  "UserAlreadyExists",
]);
