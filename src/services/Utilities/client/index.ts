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

  public static isTrutyValue(value: unknown): boolean {
    if (typeof value === "string") {
      return /^true/i.test(value);
    }

    return !!value;
  }

  public static isFalsyValue(value: unknown): boolean {
    return !Utilities.isTrutyValue(value);
  }
}

export default Utilities;
