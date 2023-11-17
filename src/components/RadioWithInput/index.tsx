import PopoverBase from "@/components/Popover";
import InputRadio from "@/components/RadioWithInput/input";
import RadioGroup from "@/components/RadioWithInput/radio";
import Line from "@/components/ui/Line";
import Stack from "@/components/ui/Stack";
import Text from "@/components/ui/Text";

import { RadioInputsState } from "@/store/useRadioInput";

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  radioLabel: string;
  isRadioRequired?: boolean;
  radioGroupName: keyof RadioInputsState;
  inputLabel?: string;
  inputDescription?: string;
  measure?: string;
  measurePlace?: "left" | "right";
  popoverContent?: string | React.ReactElement;
}

function RadioWithInput({
  radioLabel,
  isRadioRequired = false,
  radioGroupName,
  inputLabel,
  inputDescription,
  popoverContent,
  ...props
}: Props) {
  return (
    <Stack orientation="vertical" spacing={1}>
      <Stack grid cols={2} classes="mb-4 mt-2 h-32 w-full">
        <Stack as="div" orientation="vertical" classes="peer">
          <Text classes="relative font-bold">
            {radioLabel}{" "}
            {isRadioRequired && (
              <Text as="span" variant="error">
                *
              </Text>
            )}
            {!!popoverContent && (
              <PopoverBase triggerClasses="absolute -right-[15%]" content={popoverContent} />
            )}
          </Text>
          <RadioGroup radioGroupName={radioGroupName} />
        </Stack>
        <InputRadio
          id={radioGroupName}
          label={inputLabel}
          description={inputDescription}
          {...props}
        />
      </Stack>
      <Line />
    </Stack>
  );
}

export default RadioWithInput;
