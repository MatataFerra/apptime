"use client";

import Button from "@/components/ui/Button";
import Stack from "@/components/ui/Stack";
import Text from "@/components/ui/Text";

import { useShiftData } from "@/store/useShiftData";

function ShiftStartPublicHolidaysButtons() {
  const { setStep, setData } = useShiftData((state) => state);

  function onSelectOption(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    setStep("ShiftInfo");
    setData({ publicHolidayWorked: !!Number(e.currentTarget.dataset.button) });
  }

  return (
    <>
      <Stack>
        <Button
          data-button={1}
          type="button"
          variant="gradient_secondary"
          classes="h-12 w-full rounded-lg px-[5px] py-[3px]"
          onClick={onSelectOption}
        >
          <Text
            as="span"
            classes="flex h-full w-full items-center justify-center p-2 text-xs text-ink"
          >
            Yes! Money 🤑
          </Text>
        </Button>

        <Button
          type="button"
          variant="black"
          classes="h-12 w-full text-xs"
          onClick={onSelectOption}
          data-button={0}
        >
          No, regular day
        </Button>
      </Stack>
    </>
  );
}

export default ShiftStartPublicHolidaysButtons;
