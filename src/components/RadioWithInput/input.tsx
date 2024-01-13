"use client";

import { forwardRef } from "react";

import Input from "@/components/ui/Input";
import Stack from "@/components/ui/Stack";

import { useRadioInput } from "@/store/useRadioInput";

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  description?: string;
}

function InputRadio({ label, description, ...props }: Props, ref: React.Ref<HTMLInputElement>) {
  const { isInputActive } = useRadioInput();

  return (
    <>
      {isInputActive(props?.id) ? (
        <Stack as="div" orientation="vertical">
          <Input
            data-testid={`input-${props?.id}`}
            ref={ref}
            type="number"
            classes="[&>input]:h-14"
            label={label}
            description={description}
            min={1}
            {...props}
          />
        </Stack>
      ) : null}
    </>
  );
}

export default forwardRef(InputRadio);
