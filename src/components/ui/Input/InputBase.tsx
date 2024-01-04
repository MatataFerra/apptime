import { forwardRef, ReactElement, Ref } from "react";

import { InputProps } from "@/types/forms";

import Text from "@/components/ui/Text";

import { INPUT_VARIANTS } from "@/utils/constants/tailwind";
import { cm } from "@/utils/helpers/styleMerger";

import InputMeasure from "./InputMeasure";

function InputBase(props: InputProps, ref: Ref<HTMLInputElement>): ReactElement<InputProps> {
  const { classes, variant = "default", type, isError, description, measure, ...rest } = props;

  return (
    <>
      {measure ? (
        <InputMeasure {...props} ref={ref} />
      ) : (
        <input
          id={rest.name}
          ref={ref}
          type={type}
          autoComplete="off"
          className={cm(
            "rounded-lg px-2 py-1",
            type === "radio" ? INPUT_VARIANTS["radio"] : INPUT_VARIANTS[variant],
            isError ? "border border-red-600 focus:ring-red-600" : "",
            classes
          )}
          {...rest}
        />
      )}
      {description && (
        <Text classes="mt-2 block text-xs" as="small">
          {description}
        </Text>
      )}
    </>
  );
}

export default forwardRef(InputBase);
