"use client";

import Stack from "@/components/ui/Stack";
import Text from "@/components/ui/Text";

import { useShiftStateContext } from "@/store/useShiftStatusStore";

function ShiftTrackInfo() {
  const { date, earns, text, isLoading, isEmpty } = useShiftStateContext(
    (state) => state.shiftsInfo
  );

  return (
    <>
      {isEmpty ? (
        <Text classes="mx-0 my-auto block text-center text-xl text-red-700">
          {"You haven't started your shift yet! Please press the 'Start Shift' button."}
        </Text>
      ) : (
        <Stack as="div" orientation="vertical">
          <Text>
            {isLoading
              ? "loading data..."
              : !!text
                ? `last shift tracked: ${text} (${date})`
                : "waiting for the first shift"}
          </Text>
          <Text>money earn at the moment: {`${earns.toFixed(2)}`}$</Text>
        </Stack>
      )}
    </>
  );
}

export default ShiftTrackInfo;
