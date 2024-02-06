import { forwardRef, ReactElement, Ref } from "react";

import { InputProps } from "@/types/forms";

import InputBase from "@/components/ui/Input/InputBase";
import Stack from "@/components/ui/Stack";

import { cn } from "@/utils/helpers/styleMerger";

function Input(props: InputProps, ref: Ref<HTMLInputElement>): ReactElement<InputProps> {
  const { label, labelClasses, isRequired, containerClasses, spacing, ...rest } = props;

  if (label && !rest.name) {
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
          as="div"
          spacing={spacing ? spacing : undefined}
          orientation="vertical"
          classes={`${containerClasses ? containerClasses : ""}`}
        >
          <label
            htmlFor={rest.type === "radio" ? `${rest.name}-${label}` : rest.name}
            className={cn("text-sm", labelClasses ? labelClasses : "")}
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

export default forwardRef(Input);
