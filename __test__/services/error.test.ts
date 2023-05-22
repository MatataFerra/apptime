import ErrorService from "@/services/exceptions";

describe("Error Service", () => {
  test("Should show the correct message", () => {
    const message = "User not found";
    const cause = "The user does not exist in the database";
    const type_error = "UserNotFound";

    const error = new ErrorService(type_error);

    expect(error.message).toBe(message);
    expect(error.cause).toBe(cause);
    expect(error.handler).toBe(type_error);
  });
});
