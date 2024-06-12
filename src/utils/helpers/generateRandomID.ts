import uniqueId from "lodash/uniqueId";

export function generateRandomID(prefix?: string) {
  return uniqueId(prefix);
}

export function generateFixedID() {
  let id = 0;

  return function () {
    return id++;
  };
}
