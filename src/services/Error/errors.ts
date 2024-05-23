import { Prisma } from "@prisma/client";
import _ from "lodash";
import { ZodError } from "zod";

import { Exception, ExceptionsInterface } from "./factory";

/**
 * @class UserNotFound
 * @description This class is responsible for the logic related to the UserNotFound error
 * Can't parameterize the error message
 * @default Error
 * message: "User not found"
 * cause: "The user does not exist in the database"
 * type_error: "UserNotFound"
 *
 * @example
 * import { ErrorFactory } from "@/services";
 * if(!user) return ErrorFactory.createError("UserNotFound");
 *
 */
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

/**
 * @class UserAlreadyExists
 * @description This class is responsible for the logic related to the UserAlreadyExists error
 * Can't parameterize the error message
 * @default Error
 * message: "User already exists"
 * cause: "The user already exists in the database, try another email"
 * type_error: "UserAlreadyExists"
 * @example
 * import { ErrorFactory } from "@/services";
 * if(user) return ErrorFactory.createError("UserAlreadyExists");
 */
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

/**
 * @class UserNotAllowed
 * @description This class throw an error if user is not an Admin o Super User
 * @default Error
 * message: "You  are not authorized",
  cause: "You have no valid credentials to enter",
  type_error: "UserNotAllowed",
 * @example
 * import { ErrorFactory } from "@/services";
 * if(user.role !== "ADMIN") return ErrorFactory.createError("UserNotAllowed");
 */
export class UserNotAllowed extends Error implements ExceptionsInterface {
  constructor() {
    super("You  are not authorized");
  }
  exception: Exception = {
    message: "You  are not authorized",
    cause: "You have no valid credentials to enter",
    type_error: "UserNotAllowed",
  };

  handleError() {
    return this.exception;
  }
}

/**
 * @class InternalServer
 * @description This class is responsible for the logic related to the InternalServer error
 * Can parameterize the error message, recomended for try/catch blocks
 * @default Error
 * message: "Internal Server Error"
 * cause: "An error occurred on the server"
 * type_error: "InternalServer"
 *
 * @returns {Exception} - The exception object with the error information
 * @param {unknown} error - The error object
 *
 * @example
 * import { ErrorFactory } from "@/services";
 * try {
 *  await prisma.user.create({
 *     data: {
 *      ...this.user,
 *     email: this.user.email,
 *     password: this.user.password,
 *     name: this.user.name,
 *     type_account: this.user.type_account,
 *     },
 *   });
 * } catch (error) {
 *    return ErrorFactory.createError("InternalServer", {error});
 * }
 *
 *
 */
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
      this.exception.cause = error.message;
    }

    if (error instanceof Prisma.PrismaClientInitializationError) {
      this.exception.cause = error.message.split("\n").join(" ").trim();
      this.exception.message = "Prisma Client Initialization Error";
    }

    return { ...this.exception, info: error };
  }
}

/**
 * @class PasswordIsNotValid
 * @description This class is responsible for the logic related to the PasswordIsNotValid error
 * Can parameterize the error message
 * Under the hood in try/catch blocks, you can pass the error object as a parameter
 * and it evaluates if it is an instance of Error or a string
 * and set the cause property with the error message
 * @param {unknown} error - The error object
 * @default Error
 * message: "Password is not valid"
 * cause: "Please provide a valid format password"
 * type_error: "PasswordIsNotValid"
 * @returns {Exception} - The exception object with the error information
 * @example
 * import { ErrorFactory } from "@/services";
 * if(!password) return ErrorFactory.createError("PasswordIsNotValid");
 * @example
 * import { ErrorFactory } from "@/services";
 * if(!password) return ErrorFactory.createError("PasswordIsNotValid", {error: "Password is not valid"});
 * @example
 * import { ErrorFactory } from "@/services";
 * try {
 *  ...
 * } catch (error) {
 *    return ErrorFactory.createError("PasswordIsNotValid", {error});
 * }
 */
export class PasswordIsNotValid extends Error implements ExceptionsInterface {
  constructor() {
    super("Password is not valid");
  }
  exception: Exception = {
    message: "Password is not valid",
    cause: "Please provide a valid format password",
    type_error: "PasswordIsNotValid",
  };

  handleError(error: unknown) {
    if (typeof error === "string") {
      this.exception.cause = error;
      return this.exception;
    }

    if (typeof error === "object") {
      const errorClone = _.cloneDeep(error as Exception);
      this.exception.cause = errorClone.cause;
      return {
        ...this.exception,
      };
    }

    return this.exception;
  }
}

/**
 * @class DataProvidedIsNotValid
 * @description This class is responsible for the logic related to the DataProvidedIsNotValid error
 * Can parameterize the error message
 * Under the hood in try/catch blocks, you can pass the error object as a parameter
 * and it evaluates if it is an instance of ZodError
 * and set the zod property with the error message
 * @param {unknown} error - The error object
 * @default Error
 * message: "Data provided is not valid"
 * cause: "The body provided on the request doesn't match with the schema"
 * type_error: "DataProvidedIsNotValid"
 * @returns {Exception} - The exception object with the error information
 * @example
 * import { ErrorFactory } from "@/services";
 * if(!password) return ErrorFactory.createError("DataProvidedIsNotValid");
 * @example
 * import { ErrorFactory } from "@/services";
 * const userSchema = z.object({
 *    email: z.string().email(),
 *    password: z.string().min(8).max(100),
 *    name: z.string().min(3).max(100),
 *    type_account: z.string().min(3).max(100),
 * });
 * const userParsed = userSchema.safeParse(req.body);
 *
 * if(!userParsed.success) {
 *    return ErrorFactory.createError("DataProvidedIsNotValid", {error: userParsed.error});
 * }
 */
export class DataProvidedIsNotValid extends Error implements ExceptionsInterface {
  constructor() {
    super("Data provided is not valid");
  }
  exception: Exception = {
    message: "Data provided is not valid",
    cause: "The body provided on the request doesn't match with the schema",
    type_error: "DataProvidedIsNotValid",
  };

  zod?: {
    error: string;
    input: (string | number)[];
  }[];

  handleError(error: unknown) {
    if (error instanceof ZodError) {
      this.zod = error.issues.map((issue) => ({
        error: issue.message,
        input: issue.path,
      }));
    }
    return { ...this.exception, fields: this.zod };
  }
}

/**
 * @class PrismaClientFields
 * @description This class is responsible for the logic related to the PrismaClientFields error
 * When you don't provided the fields on the prisma query this error is thrown
 * @default Error
 * message: "Please provide valid fields"
 * cause: "Prisma detect invalid fields on your request"
 * type_error: "PrismaClientFields"
 * @returns {Exception} - The exception object
 * @example
 * import { ErrorFactory } from "@/services";
 * try {
 *    const user = await prisma.user.findUnique({...})
 *
 *    if(!user) return ErrorFactory.createError("PrismaClientFields");
 *
 * } catch (error) {
 *    ...
 * }
 */
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

/**
 * @class PrismaClientQuery
 * @description This class is responsible for the logic related to the PrismaClientQuery error
 * When you don't provided the query on the prisma query this error is thrown
 * @default Error
 * message: "Please provide valid query"
 * cause: "Prisma detect invalid query on your request"
 * type_error: "PrismaClientQuery"
 * @returns {Exception} - The exception object
 * @example
 * import { ErrorFactory } from "@/services";
 * try {
 *    const user = await prisma.user.findUnique({
 *      where: {
 *       id: query.id
 *      }
 *    });
 *
 *    if(!user) return ErrorFactory.createError("PrismaClientQuery");
 *
 * } catch (error) {
 *   ...
 * }
 */
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

/**
 * @class ShiftNotFound
 * @description This class is responsible for the logic related to the ShiftNotFound error
 * When you try to find a shift and it doesn't exist this error is thrown
 * @default Error
 * message: "Shift not found"
 * cause: "The shift does not exist in the database"
 * type_error: "ShiftNotFound"
 * @returns {Exception} - The exception object
 * @example
 * import { ErrorFactory } from "@/services";
 * try {
 *  const shift = await prisma.shift.findUnique({
 *   where: {
 *   id: query.id
 *  }
 * });
 *
 * if(!shift) return ErrorFactory.createError("ShiftNotFound");
 *
 * } catch (error) {
 *  ...
 * }
 *
 */
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

/**
 * @class BodyNotProvided
 * @description This class is responsible for the logic related to the BodyNotProvided error
 * When you don't provided the body on the request this error is thrown
 * @default Error
 * message: "Please provide the body see docs /api-doc for more info"
 * cause: "Body not provided"
 * type_error: "BodyNotProvided"
 * @returns {Exception} - The exception object
 * @example
 * import { ErrorFactory } from "@/services";
 *
 * ...
 * if(!req.body) return ErrorFactory.createError("BodyNotProvided");
 * ...
 *
 *
 */
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

/**
 * @class PrismaClientCreateRecord
 * @description This class is responsible for the logic related to the PrismaClientCreateRecord error
 * When you don't provided the data to create a record this error is thrown
 * @default Error
 * message: "Please provide a valid data to create the record"
 * cause: "Data to create not found."
 * type_error: "PrismaClientCreateRecord"
 *
 * @returns {Exception} - The exception object
 * @example
 * import { ErrorFactory } from "@/services";
 * try {
 * const shift = await prisma.shift.create({
 *  data: {
 *  ...
 * }
 * });
 *
 * if(!shift) return ErrorFactory.createError("PrismaClientCreateRecord");
 *
 * } catch (error) {
 * ...
 * }
 */

export class PrismaClientUpdateRecord extends Error implements ExceptionsInterface {
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

/**
 * @class ProfileNotFound
 * @description This class is responsible for the logic related to the ProfileNotFound error
 * When you try to find a profile and it doesn't exist this error is thrown
 * @default Error
 * message: "Profile not found"
 * cause: "The profile does not exist in the database"
 * type_error: "ProfileNotFound"
 * @returns {Exception} - The exception object
 * @example
 * import { ErrorFactory } from "@/services";
 * try {
 *    const profile = await prisma.profile.findUnique({
 *      where: {
 *        id: query.id
 *      }
 *    });
 *
 *    if(!profile) return ErrorFactory.createError("ProfileNotFound");
 *
 * } catch (error) {
 *    ...
 * }
 */

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

/**
 * @class ProfileAlreadyExists
 * @description This class is responsible for the logic related to the ProfileAlreadyExists error
 * When you try to find a profile and it already exists this error is thrown
 * @default Error
 * message: "Profile already exists"
 * cause: "The profile already exists in the database, try another user id or update the record"
 * type_error: "ProfileAlreadyExists"
 * @returns {Exception} - The exception object
 * @example
 * import { ErrorFactory } from "@/services";
 * try {
 *   const profile = await prisma.profile.findUnique({...});

 * if(profile) return ErrorFactory.createError("ProfileAlreadyExists");
 * 
 * } catch (error) {
 *  ...
 * }
 */
export class ProfileAlreadyExists extends Error implements ExceptionsInterface {
  constructor() {
    super("Profile already exists");
  }
  exception: Exception = {
    message: "Profile already exists",
    cause: "The profile already exists in the database, try another user id or update the record",
    type_error: "ProfileAlreadyExists",
  };

  handleError() {
    return this.exception;
  }
}

/**
 * @class SettingsNotUpdated
 * @description This class is responsible for the logic related to the SettingsNotUpdated error
 * When you try to update the settings and it fails this error is thrown
 * @default Error
 * message: "Settings could not be updated"
 * cause: "An error occurred while updating the settings"
 * type_error: "SettingsNotUpdated"
 * @returns {Exception} - The exception object
 * @example
 * import { ErrorFactory } from "@/services";
 * try {
 *  const updateSettings = await prisma?.$transaction([
 *   prisma.user.update({
 *    where: { id: user.id },
 *    data: {
 *      email: checkData.data.email,
 *      name: checkData.data.name,
 *    },
 *  }),
 *  prisma.config.update({
 *    where: { userId: user.id },
 *    data: {
 *      weekStartsOn: checkData.data.weekStartsOn,
 *    },
 *  }),
 * ]);
 *
 * if(!updateSettings) {
 *  return ErrorFactory.createError("SettingsNotUpdated");
 * }
 *
 * } catch (error) {
 * ...
 * }
 *
 *
 */
export class SettingsNotUpdated extends Error implements ExceptionsInterface {
  constructor() {
    super("Settings could not be updated");
  }

  exception: Exception = {
    message: "Settings could not be updated",
    cause: "An error occurred while updating the settings",
    type_error: "SettingsNotUpdated",
  };

  handleError() {
    return this.exception;
  }
}
