import { forwardRef, type Ref } from "react";

import { EyeClosedIcon, EyeOpenIcon } from "@radix-ui/react-icons";

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
 * @param showPassword
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
    containerClasses,
    showPassword = false,
    onShowPasswordChange,
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

  if (showPassword && !onShowPasswordChange && process.env.NODE_ENV === "development") {
    // eslint-disable-next-line no-console
    console.log(
      "\x1b[31m%s\x1b[0m",
      "showPassword is true, the input needs to be controlled with onShowPasswordChange()"
    );
  }

  return (
    <div className={cn(containerClasses, "w-full")}>
      {label && (
        <label
          htmlFor={props.name}
          className={cn("mb-1.5 block text-sm font-medium text-ink", labelClasses)}
        >
          {label}
        </label>
      )}

      <div
        className={cn(
          "group flex w-full items-center justify-between rounded-md bg-transparent px-3 py-2",
          type === "radio" || type === "checkbox"
            ? INPUT_VARIANTS["radio"]
            : INPUT_VARIANTS[variant],
          variant === "underline" && "border-none",
          isError && "border-destructive focus-within:border-destructive focus-within:ring-destructive/15",
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
              ? "border-b-2 border-b-border transition-colors hover:border-b-border-strong focus:border-b-accent"
              : "border-none",
            "h-full w-full bg-transparent text-ink outline-hidden placeholder:text-ink-subtle",
            measurePlace === "left" ? "order-2" : "order-1"
          )}
          {...props}
        />
        {measure && (
          <span
            className={cn(
              "text-sm text-ink-muted",
              measurePlace === "left" ? "order-1" : "order-2"
            )}
          >
            {measure}
          </span>
        )}
        {showPassword ? (
          <>
            <label htmlFor={"eye-" + props.name} className="order-2 cursor-pointer text-ink-muted">
              <input
                hidden
                type="checkbox"
                id={"eye-" + props.name}
                className="peer"
                onChange={onShowPasswordChange}
              />
              <EyeClosedIcon className={cn("block", "peer-checked:hidden")} />
              <EyeOpenIcon className={cn("hidden", "peer-checked:block")} />
            </label>
          </>
        ) : null}
      </div>
      {description && (
        <small
          className={cn(
            "mt-1 block text-xs",
            isError ? "text-destructive" : "text-ink-muted"
          )}
        >
          {description}
        </small>
      )}
    </div>
  );
});

export default input;
