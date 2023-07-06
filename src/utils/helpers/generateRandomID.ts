import _ from "lodash";

export function generateRandomID(prefix?: string) {
  return _.uniqueId(prefix);
}
