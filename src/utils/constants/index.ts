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

  InternalServer: {
    message: "Internal Server Error",
    cause: "An error occurred on the server",
    type_error: "InternalServer",
  },

  PrismaClientFields: {
    message: "Please provide valid fields",
    cause: "Prisma detect invalid fields on your request",
    type_error: "PrismaClientFields",
  },

  QueryNotProvided: {
    message: "Please provide the query string see docs /api-doc for more info",
    cause: "Query string not provided",
    type_error: "QueryNotProvided",
  },

  ShiftNotFound: {
    message: "Shift not found",
    cause: "The shift does not exist in the database",
    type_error: "ShiftNotFound",
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
  "ShiftNotFound",
  "InternalServer",
  "PrismaClientFields",
  "QueryNotProvided",
]);
