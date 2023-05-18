import { NextApiRequest, NextApiResponse } from "next";

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
