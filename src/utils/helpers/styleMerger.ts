import { clsx } from "clsx";
import { ClassNameValue, twMerge } from "tailwind-merge";

/**
 * @description Function to merge tailwind classes also you can use conditional styles
 * the cm name is short for class merger
 * @param styles tailwind classes or CSS classes
 * @returns string of tailwind classes
 *
 * @example
 * import { cm } from "utils/helpers";
 *
 * const styles = cm("text-red-500", "text-2xl", "text-center", "text-bold", {
 *  "text-bold": true,
 * "text-italic": false,
 * });
 *
 * <div className={styles}>Hello World</div>
 *
 * // Output
 * <div className="text-red-500 text-2xl text-center text-bold">Hello World</div>
 *
 */
export function cm(...styles: ClassNameValue[]) {
  return clsx(twMerge(...styles));
}
