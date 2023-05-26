import { HandleErrorType, InterfaceConfig } from "@/types/services";
import { z } from "zod";

export const EXCEPTIONS: Record<HandleErrorType, InterfaceConfig["config"]> = {
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
  BodyNotProvided: {
    message: "Please provide the body see docs /api-doc for more info",
    cause: "Body not provided",
    type_error: "BodyNotProvided",
  },
  PrismaClientUpdateRecord: {
    message: "Please provide a valid id to update the record",
    cause: "Record to update not found.",
    type_error: "PrismaClientUpdateRecord",
  },
};

/**
 * @description Enum to handle errors
 *
 */
export const HandleErrorTypeSchema = z.enum([
  "UserNotFound",
  "UserAlreadyExists",
  "ShiftNotFound",
  "InternalServer",
  "PrismaClientFields",
  "PrismaClientUpdateRecord",
  "QueryNotProvided",
  "BodyNotProvided",
]);
