import { type ClassValue, clsx } from "clsx";
import { ClassNameValue, extendTailwindMerge } from "tailwind-merge";

// Teach tailwind-merge about the custom font sizes in globals.css so that
// e.g. `text-figure` is treated as a size and not dropped in favour of `text-ink`.
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      text: ["figure", "clamp-1-to-2_5", "clamp-1-to-3"],
      shadow: ["float", "button", "button-inner", "input"],
    },
  },
});

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

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
