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
        <Text classes="mx-0 my-auto block text-center text-2xl">
          You don&apos;t have any shift tracked yet,{" "}
          <Text as="span" classes="text-2xl text-cyan-500 underline">
            please start one.
          </Text>
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
