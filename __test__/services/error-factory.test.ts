import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import ErrorFactory from "@/services/Error/factory";

let log: ReturnType<typeof vi.spyOn>;
beforeEach(() => {
  log = vi.spyOn(console, "error").mockImplementation(() => undefined);
});
afterEach(() => log.mockRestore());

// What a failed query looks like: table, field and query details.
const dbError = new Error(
  "Invalid `prisma.user.findUnique()` invocation: column Account.password does not exist"
);

describe("errors that reach the client", () => {
  test("InternalServer: a generic message, the details only in the server log", () => {
    const result = ErrorFactory.createError("InternalServer", { error: dbError });
    expect(result).toEqual({
      message: "Internal Server Error",
      cause: "An error occurred on the server",
      type_error: "InternalServer",
    });
    expect(JSON.stringify(result)).not.toContain("prisma");
    expect(log).toHaveBeenCalledWith("[InternalServer]", dbError);
  });

  test("a custom message still reaches the client, a thrown error doesn't", () => {
    expect(ErrorFactory.createError("CustomError", { message: "Try again later" })).toMatchObject({
      info: "Try again later",
    });
    const thrown = ErrorFactory.createError("CustomError", { error: dbError });
    expect(thrown).not.toHaveProperty("info");
    expect(JSON.stringify(thrown)).not.toContain("prisma");
  });
});
