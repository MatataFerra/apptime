import { isEmpty } from "lodash";
import { redirect } from "next/navigation";

class Utilities {
  /**
   * @description Redirect the user to a specific page, doesn't require request object
   * @param destination - The destination to redirect the user to.
   */

  public static redirectTo(destination: string) {
    return redirect(destination);
  }

  /**
   * @description Check if the value is a truty value.
   * @param value {string} - The value to check if it's a truty value.
   * @returns {boolean} - Returns true if the value is a truty value.
   */

  public static isTruthyValue(value: unknown): boolean {
    if (typeof value === "string") {
      return /^true/i.test(value);
    }

    if (typeof value === "number") {
      return value !== 0;
    }

    if (typeof value === "boolean") {
      return value;
    }

    if (typeof value === "object") {
      return !isEmpty(value);
    }

    return !!value;
  }

  public static isFalsyValue(value: unknown): boolean {
    return !Utilities.isTruthyValue(value);
  }
}

export default Utilities;
