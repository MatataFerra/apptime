import { forwardRef, Ref } from "react";

import { InputProps } from "@/types/forms";

import { INPUT_VARIANTS } from "@/utils/constants/tailwind";
import { cn } from "@/utils/helpers/styleMerger";

/**
 *
 * @param variant
 * @param type
 * @param isError
 * @param isRequired
 * @param classes
 * @param name
 * @param description
 * @param measure
 * @param measurePlace
 * @param ref
 * @returns
 */

const input = forwardRef(function Input(
  {
    variant = "default",
    type,
    isError,
    isRequired,
    classes,
    description,
    measure,
    measurePlace,
    label,
    labelClasses,
    basis,
    containerClasses,
    ...props
  }: InputProps,
  ref: Ref<HTMLInputElement>
) {
  if (label && !props.name && process.env.NODE_ENV === "development") {
    // eslint-disable-next-line no-console
    console.log(
      "\x1b[31m%s\x1b[0m",
      "Input component with label: " + "'" + label + "'" + " must have a name prop"
    );
  }

  const flexBasis = basis ? `${basis}` : "input-flex";

  return (
    <section className={cn(flexBasis, containerClasses, "w-full")}>
      {label && (
        <label
          htmlFor={props.name}
          className={cn("text-sm text-slate-600 dark:text-gray-100", labelClasses)}
        >
          {label}
        </label>
      )}

      <div
        className={cn(
          "flex w-full items-center justify-between rounded-lg bg-transparent px-2 py-2",
          type === "radio" || type === "checkbox"
            ? INPUT_VARIANTS["radio"]
            : INPUT_VARIANTS[variant],
          variant === "underline" ? "border-none" : "border border-gray-200",
          isError ? "border-2 border-red-600 focus:ring-red-600" : "",
          "h-fit min-h-12",
          "gap-2",
          classes
        )}
      >
        <input
          id={props.name}
          ref={ref}
          type={type}
          autoComplete="off"
          className={cn(
            variant === "underline"
              ? "border-b-2 border-b-slate-200 transition-colors hover:border-b-slate-400/60 focus:border-b-blue-600"
              : "border-none",
            "h-full w-full outline-none",
            measurePlace === "left" ? "order-2" : "order-1"
          )}
          {...props}
        />
        {measure && (
          <span
            className={cn(
              "text-sm text-slate-600 dark:text-gray-100",
              measurePlace === "left" ? "order-1" : "order-2"
            )}
          >
            {measure}
          </span>
        )}
      </div>
      {description && (
        <small
          className={cn(
            "mt-0 block text-[.5rem]",
            isError ? "font-semibold text-red-500" : "font-normal text-slate-600"
          )}
        >
          {description}
        </small>
      )}
    </section>
  );
});

export default input;
