import { NextApiRequest, NextApiResponse } from "next";
import { createMocks } from "node-mocks-http";
import { RequestMethod } from "node-mocks-http";

export const hasEqualKeysTwoObjects = (obj1: any, obj2: any): boolean => {
  return Object.keys(obj1)
    .sort((a, b) => a.localeCompare(b))
    .every(
      (k) =>
        k in obj2 &&
        (typeof obj1[k] != "object" ||
          (typeof obj2[k] == "object" &&
            hasEqualKeysTwoObjects(obj1[k], obj2[k])))
    );
};

export const mockRequestResponse = (method: RequestMethod = "GET") => {
  const { req, res }: { req: NextApiRequest; res: NextApiResponse } =
    createMocks({ method });

  return { req, res };
};
