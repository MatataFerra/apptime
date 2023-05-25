import ErrorFactory from "@/services/Error/factory"; // Asegúrate de que la ruta sea correcta para tu proyecto
import { EXCEPTIONS } from "@/utils/constants";

describe("ErrorFactory", () => {
  test("should create UserNotFound error", () => {
    const error = ErrorFactory.createError("UserNotFound");

    expect(error).toHaveProperty(
      "exception.message",
      EXCEPTIONS.UserNotFound.message
    );
    expect(error).toHaveProperty(
      "exception.cause",
      EXCEPTIONS.UserNotFound.cause
    );
    expect(error).toHaveProperty(
      "exception.type_error",
      EXCEPTIONS.UserNotFound.type_error
    );
  });

  test("should handle UserNotFound error correctly", () => {
    const error = ErrorFactory.createError("UserNotFound");

    // Check that error has the expected properties
    expect(error.exception.message).toEqual(EXCEPTIONS.UserNotFound.message);
    expect(error.exception.cause).toEqual(EXCEPTIONS.UserNotFound.cause);
    expect(error.exception.type_error).toEqual(
      EXCEPTIONS.UserNotFound.type_error
    );
  });

  test("Check if can throw QueryNotProvided error", () => {
    const error = ErrorFactory.createError("QueryNotProvided");

    // Check that error has the expected properties
    expect(error.exception.message).toEqual(
      EXCEPTIONS.QueryNotProvided.message
    );
    expect(error.exception.cause).toEqual(EXCEPTIONS.QueryNotProvided.cause);
    expect(error.exception.type_error).toEqual(
      EXCEPTIONS.QueryNotProvided.type_error
    );
  });

  test("should throw an error for unsupported error type", () => {
    expect(() => {
      // @ts-ignore
      ErrorFactory.createError("UnsupportedTypeError");
    }).toThrow(new Error(`Error type 'UnsupportedTypeError' not supported`));
  });
});
