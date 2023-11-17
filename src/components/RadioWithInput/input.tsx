"use client";

import Input from "@/components/ui/Input";
import Stack from "@/components/ui/Stack";

import { useRadioInput } from "@/store/useRadioInput";

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  description?: string;
}

function InputRadio({ label, description, ...props }: Props) {
  const { isInputActive } = useRadioInput();

  return (
    <>
      {isInputActive(props?.id) ? (
        <Stack as="div" orientation="vertical" classes="animate-fade-in">
          <Input
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

export default InputRadio;
