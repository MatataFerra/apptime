import _ from "lodash";
import {
  UserNotFound,
  UserAlreadyExists,
  BodyNotProvided,
  InternalServer,
  PrismaClientFields,
  PrismaClientUpdateRecord,
  ProfileAlreadyExists,
  ProfileNotFound,
  QueryNotProvided,
  ShiftNotFound,
  PasswordIsNotValid,
  DataProvidedIsNotValid,
} from "./errors";
import { HandleErrorType } from "@/types";

export type Exception = {
  message: string;
  cause?: string;
  type_error: HandleErrorType;
};

export interface ExceptionsInterface {
  exception: Exception;
  stack?: string;
  zod?: {
    error: string;
    input: (string | number)[];
  }[];
  handleError(...args: unknown[]): Exception;
}

export class ErrorBoundary extends Error implements ExceptionsInterface {
  constructor() {
    super("An error occurred");
  }

  exception: Exception = {
    message: "An error occurred",
    cause: "An Unhandled error occurred",
    type_error: "CustomError",
  };

  handleError(error?: unknown) {
    if (error instanceof Error) {
      this.exception.cause = error.message;
    }

    return { ...this.exception, info: error };
  }
}

interface ErrorFactoryInterface {
  createError(
    exception: HandleErrorType,
    options?: { message?: string; error?: unknown }
  ): Exception;

  findAndCreateError(
    exception: HandleErrorType,
    options?: { message?: string; error?: unknown }
  ): ExceptionsInterface;
}

class ErrorFactory implements ErrorFactoryInterface {
  createError(
    exception: HandleErrorType,
    options?: { message?: string; error?: unknown }
  ): any {
    if (exception === "UserNotFound") {
      return new UserNotFound().handleError();
    }

    if (exception === "UserAlreadyExists") {
      return new UserAlreadyExists().handleError();
    }

    if (exception === "BodyNotProvided") {
      return new BodyNotProvided().handleError();
    }

    if (exception === "InternalServer") {
      return new InternalServer().handleError(options?.error);
    }

    if (exception === "PrismaClientFields") {
      return new PrismaClientFields().handleError();
    }

    if (exception === "PrismaClientUpdateRecord") {
      return new PrismaClientUpdateRecord().handleError();
    }

    if (exception === "ProfileAlreadyExists") {
      return new ProfileAlreadyExists().handleError();
    }

    if (exception === "ProfileNotFound") {
      return new ProfileNotFound().handleError();
    }

    if (exception === "QueryNotProvided") {
      return new QueryNotProvided().handleError();
    }

    if (exception === "ShiftNotFound") {
      return new ShiftNotFound().handleError();
    }

    if (exception === "PasswordIsNotValid") {
      return new PasswordIsNotValid().handleError(options?.error);
    }

    if (exception === "DataProvidedIsNotValid") {
      return new DataProvidedIsNotValid().handleError(options?.error);
    }

    if (exception === "CustomError") {
      return new ErrorBoundary().handleError(
        options?.message || "Custom error"
      );
    }

    return new ErrorBoundary().handleError(
      `Error type '${exception}' not supported`
    );

    // throw new Error(`Error type '${exception}' not supported`);
  }
  findAndCreateError(
    exception: HandleErrorType,
    options?: { message?: string; error?: unknown }
  ): ExceptionsInterface {
    const errors = Array.from(
      Object.values({
        UserNotFound,
        UserAlreadyExists,
        BodyNotProvided,
        InternalServer,
        PrismaClientFields,
        PrismaClientUpdateRecord,
        ProfileAlreadyExists,
        ProfileNotFound,
        QueryNotProvided,
        ShiftNotFound,
        PasswordIsNotValid,
        DataProvidedIsNotValid,
      })
    );

    const error = errors.find((error) => error.name === exception);

    if (error) {
      return new error();
    }

    throw new Error(`Error type '${exception}' not supported`);
  }
}

const errorFactory = new ErrorFactory();

export default errorFactory;
