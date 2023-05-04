import { beforeAll, describe, expect, test } from "vitest";
import userRoute from "@/pages/api/user";
import type { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import { createRequest, createResponse, RequestOptions } from "node-mocks-http";
import userMock from "test/mocks/user.prisma.json";
import { TypeData } from "@/types";

type ApiRequest = NextApiRequest & ReturnType<typeof createRequest>;
type APiResponse = NextApiResponse & ReturnType<typeof createResponse>;

const toEqualKeys = (obj1: any, obj2: any): boolean =>
  Object.keys(obj1).every(
    (k) =>
      k in obj2 &&
      (typeof obj1[k] != "object" ||
        (typeof obj2[k] == "object" && toEqualKeys(obj1[k], obj2[k])))
  );

export const testHandler = async (
  handler: NextApiHandler,
  options: RequestOptions
) => {
  const req = createRequest<ApiRequest>(options);
  const res = createResponse<APiResponse>();

  await handler(req, res);
  return res;
};

describe("Testing Api route hello", () => {
  let response: APiResponse;
  beforeAll(async () => {
    response = await testHandler(userRoute, { method: "GET" });
  });

  test("should return a successful response from Postgres", async () => {
    expect(response.statusCode).toBe(200);
  });

  test("Should return data from server", async () => {
    expect(response._getJSONData()).to.haveOwnProperty("message");
    expect(response._getJSONData()).to.haveOwnProperty("response");
    expect(response._getJSONData()).to.haveOwnProperty("shift");
    expect(response._getJSONData()).to.haveOwnProperty("user");
  });

  test("should user has the right shape", () => {
    const user: TypeData = response._getJSONData().user;

    expect(toEqualKeys(user, userMock.user)).toBeTruthy();
  });
});
