import { forwardRef, ReactElement, Ref } from "react";

import { InputProps } from "@/types/forms";

import InputBase from "@/components/ui/Input/InputBase";
import Stack from "@/components/ui/Stack";

import { cn } from "@/utils/helpers/styleMerger";

function Input(props: InputProps, ref: Ref<HTMLInputElement>): ReactElement<InputProps> {
  const { label, labelClasses, isRequired, containerClasses, spacing, ...rest } = props;

  if (label && !rest.name && process.env.NODE_ENV === "development") {
    // eslint-disable-next-line no-console
    console.log(
      "\x1b[31m%s\x1b[0m",
      "Input component with label: " + "'" + label + "'" + " must have a name prop"
    );
  }

  return (
    <>
      {label ? (
        <Stack
          as="section"
          spacing={spacing ? spacing : undefined}
          orientation="vertical"
          classes={`${containerClasses ? containerClasses : ""}`}
        >
          <label
            htmlFor={rest.type === "radio" ? `${rest.name}-${label}` : rest.name}
            className={cn("text-xs", labelClasses ? labelClasses : "")}
          >
            <span className="flex gap-1">
              {label} {isRequired && <span className="font-bold text-red-500">*</span>}
            </span>
          </label>
          <InputBase {...rest} ref={ref} />
        </Stack>
      ) : (
        <>
          <InputBase {...rest} ref={ref} />
        </>
      )}
    </>
  );
}

/**
 * @deprecated Use Input_v2 instead
 * Input component
 * @prop {String} classes - Tailwind classes
 * @prop {String} containerClasses - Tailwind classes
 * @prop {String} labelClasses - Tailwind classes
 * @prop {String} variant - Tailwind classes
 * @prop {String} type - Input type
 * @prop {Number} spacing - Spacing between label and input
 * @prop {Boolean} isError - Input error
 * @prop {Boolean} isRequired - Input required
 * @prop {String} label - Input label
 * @prop {String} description - Input description
 * @prop {String} measure - Input measure unit (e.g. $, €, %)
 * @prop {String} measurePlace - Input measure place (left or right)
 * @prop {Ref<HTMLInputElement>} ref
 * @returns {ReactElement<InputProps>}
 * @example
 * ```tsx
 * <Input
 *  type="time"
 *  name="hours"
 *  label="Hours"
 *  description="e.g.: 10.30 - with dot, NOT colon"
 * />
 * ```
 */

export default forwardRef(Input);
