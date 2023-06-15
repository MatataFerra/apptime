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
} from "./errors";
import { HandleErrorType } from "@/types";

const USER_NOT_FOUND = {
  message: "User not found",
  cause: "The user does not exist in the database",
  type_error: "UserNotFound",
};

export type Exception = {
  message: string;
  cause?: string;
  type_error: string;
};

export interface ExceptionsInterface {
  exception: Exception;
  stack?: string | undefined;
  handleError(...args: any[]): Exception;
}

export class ErrorBoundary extends Error implements ExceptionsInterface {
  constructor(message: string) {
    super(message);
    this.message = message;
  }
  get exception() {
    return {
      message: this.message,
      type_error: "CustomError",
    };
  }

  handleError() {
    return this.exception;
  }
}

interface ErrorFactoryInterface {
  createError(
    exception: HandleErrorType,
    options?: { message?: string; error?: unknown }
  ): Exception;
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

    if (exception === "CustomError") {
      return new ErrorBoundary(
        options?.message || "Custom error"
      ).handleError();
    }

    return new ErrorBoundary(
      `Error type '${exception}' not supported`
    ).handleError();

    // throw new Error(`Error type '${exception}' not supported`);
  }
}

const errorFactory = new ErrorFactory();

export default errorFactory;
