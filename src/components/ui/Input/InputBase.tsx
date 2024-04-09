import { forwardRef, ReactElement, Ref } from "react";

import { InputProps } from "@/types/forms";

import Text from "@/components/ui/Text";

import { INPUT_VARIANTS } from "@/utils/constants/tailwind";
import { cn } from "@/utils/helpers/styleMerger";

import InputMeasure from "./InputMeasure";

function InputBase(props: InputProps, ref: Ref<HTMLInputElement>): ReactElement<InputProps> {
  const { classes, variant = "default", type, isError, description, measure, ...rest } = props;

  return (
    <>
      {measure ? (
        <InputMeasure {...props} ref={ref} />
      ) : description ? (
        <div>
          <input
            id={rest.name}
            ref={ref}
            type={type}
            className={cn(
              "rounded-lg border border-gray-200 px-2 py-1",
              type === "radio" || type === "checkbox"
                ? INPUT_VARIANTS["radio"]
                : INPUT_VARIANTS[variant],
              isError ? "border border-red-600 focus:ring-red-600" : "",
              classes
            )}
            {...rest}
          />
          <Text classes="block text-xs" color="text-stone-400" as="span">
            {description}
          </Text>
        </div>
      ) : (
        <input
          id={rest.name}
          ref={ref}
          type={type}
          className={cn(
            "rounded-lg border border-gray-200 px-2 py-1",
            type === "radio" || type === "checkbox"
              ? INPUT_VARIANTS["radio"]
              : INPUT_VARIANTS[variant],
            isError ? "border border-red-600 focus:ring-red-600" : "",
            classes
          )}
          {...rest}
        />
      )}
    </>
  );
}

export default forwardRef(InputBase);
