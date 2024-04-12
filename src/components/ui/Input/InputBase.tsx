import { forwardRef, ReactElement, Ref } from "react";

import { InputProps } from "@/types/forms";

import Stack from "@/components/ui/Stack";
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
        <Stack
          orientation="vertical"
          classes={cn(
            "rounded-lg border border-gray-200 px-2 py-2",
            type === "radio" || type === "checkbox"
              ? INPUT_VARIANTS["radio"]
              : INPUT_VARIANTS[variant],
            isError ? "border border-red-600 focus:ring-red-600" : "",
            classes
          )}
        >
          <input id={rest.name} ref={ref} type={type} className="w-full" {...rest} />
          <Text classes="block text-xs" color="text-stone-400" as="span">
            {description}
          </Text>
        </Stack>
      ) : (
        <section
          className={cn(
            "rounded-lg border border-gray-200 bg-transparent px-2 py-2",
            type === "radio" || type === "checkbox"
              ? INPUT_VARIANTS["radio"]
              : INPUT_VARIANTS[variant],
            isError ? "border border-red-600 focus:ring-red-600" : "",
            classes
          )}
        >
          <input id={rest.name} ref={ref} type={type} className="w-full" {...rest} />
        </section>
      )}
    </>
  );
}

export default forwardRef(InputBase);
