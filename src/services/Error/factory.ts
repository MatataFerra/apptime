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
import { HandleErrorType } from "@/types/services";

export type Exception = {
  message: string;
  cause?: string;
  type_error: string;
};

export interface ExceptionsInterface {
  exception: Exception;
  stack?: string | undefined;
  handleError(): Exception;
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
  createError(exception: HandleErrorType, message?: string): Exception | Error;
}

class ErrorFactory implements ErrorFactoryInterface {
  public createError(
    exception: HandleErrorType,
    message?: string
  ): Exception | Error {
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
      return new InternalServer().handleError();
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
        message || "Please provide a more accurate message"
      ).handleError();
    }

    throw new Error(`Error type '${exception}' not supported`);
  }
}

const errorFactory = new ErrorFactory();

export default errorFactory;
