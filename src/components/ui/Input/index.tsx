import { forwardRef, ReactElement, Ref } from "react";

import { InputProps } from "@/types/forms";

import InputBase from "@/components/ui/Input/InputBase";
import Stack from "@/components/ui/Stack";

import { cn } from "@/utils/helpers/styleMerger";

function Input(props: InputProps, ref: Ref<HTMLInputElement>): ReactElement<InputProps> {
  const { label, labelClasses, isRequired, containerClasses, ...rest } = props;

  return (
    <>
      {label ? (
        <Stack
          as="div"
          orientation="vertical"
          classes={`${containerClasses ? containerClasses : ""}`}
        >
          <label className={cn("text-sm", labelClasses)}>
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
