import { PrismaClientInitializationError } from "@prisma/client/runtime/library";
import { Exception, ExceptionsInterface } from "./factory";

export class UserNotFound extends Error implements ExceptionsInterface {
  exception: Exception = {
    message: "User not found",
    cause: "The user does not exist in the database",
    type_error: "UserNotFound",
  };

  constructor() {
    super("User not found");
    this.stack = "";
  }

  handleError() {
    return this.exception;
  }
}

export class UserAlreadyExists extends Error implements ExceptionsInterface {
  constructor() {
    super("User already exists");
  }
  exception: Exception = {
    message: "User already exists",
    cause: "The user already exists in the database, try another email",
    type_error: "UserAlreadyExists",
  };

  handleError(): Exception {
    return this.exception;
  }
}

export class InternalServer extends Error implements ExceptionsInterface {
  constructor() {
    super("Internal Server Error");
  }
  exception: Exception = {
    message: "Internal Server Error",
    cause: "An error occurred on the server",
    type_error: "InternalServer",
  };

  handleError(error: unknown) {
    if (error instanceof Error) {
      this.stack = error.stack;
    }

    if (error instanceof PrismaClientInitializationError) {
      this.exception.cause = error.message.split("\n").join(" ").trim();
      this.exception.message = "Prisma Client Initialization Error";
    }

    return this.exception;
  }
}

export class PrismaClientFields extends Error implements ExceptionsInterface {
  constructor() {
    super("Please provide valid fields");
  }
  exception: Exception = {
    message: "Please provide valid fields",
    cause: "Prisma detect invalid fields on your request",
    type_error: "PrismaClientFields",
  };

  handleError() {
    return this.exception;
  }
}

export class QueryNotProvided extends Error implements ExceptionsInterface {
  constructor() {
    super("Please provide the query string see docs /api-doc for more info");
  }
  exception: Exception = {
    message: "Please provide the query string see docs /api-doc for more info",
    cause: "Query string not provided",
    type_error: "QueryNotProvided",
  };

  handleError() {
    return this.exception;
  }
}

export class ShiftNotFound extends Error implements ExceptionsInterface {
  constructor() {
    super("Shift not found");
  }
  exception: Exception = {
    message: "Shift not found",
    cause: "The shift does not exist in the database",
    type_error: "ShiftNotFound",
  };

  handleError() {
    return this.exception;
  }
}

export class BodyNotProvided extends Error implements ExceptionsInterface {
  constructor() {
    super("Please provide the body see docs /api-doc for more info");
  }
  exception: Exception = {
    message: "Please provide the body see docs /api-doc for more info",
    cause: "Body not provided",
    type_error: "BodyNotProvided",
  };

  handleError() {
    return this.exception;
  }
}

export class PrismaClientUpdateRecord
  extends Error
  implements ExceptionsInterface
{
  constructor() {
    super("Please provide a valid id to update the record");
  }
  exception: Exception = {
    message: "Please provide a valid id to update the record",
    cause: "Record to update not found.",
    type_error: "PrismaClientUpdateRecord",
  };

  handleError() {
    return this.exception;
  }
}

export class ProfileNotFound extends Error implements ExceptionsInterface {
  constructor() {
    super("Profile not found");
  }
  exception: Exception = {
    message: "Profile not found",
    cause: "The profile does not exist in the database",
    type_error: "ProfileNotFound",
  };

  handleError() {
    return this.exception;
  }
}

export class ProfileAlreadyExists extends Error implements ExceptionsInterface {
  constructor() {
    super("Profile already exists");
  }
  exception: Exception = {
    message: "Profile already exists",
    cause:
      "The profile already exists in the database, try another user id or update the record",
    type_error: "ProfileAlreadyExists",
  };

  handleError() {
    return this.exception;
  }
}
