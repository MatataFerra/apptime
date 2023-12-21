"use client";

import Loader from "@/components/ui/Loader";
import Stack from "@/components/ui/Stack";
import Text from "@/components/ui/Text";

import { useShiftStateContext } from "@/store/useShiftStatusStore";

function ShiftInfo() {
  const { date, earns, text, isLoading } = useShiftStateContext((state) => state.shiftsInfo);

  return (
    <>
      {isLoading ? (
        <Loader.spinner containerClasses="flex w-full h-full justify-center items-center" />
      ) : (
        <>
          <Stack as="div" orientation="vertical">
            <Text>last shift tracked: {`${text} (${date})`}</Text>
            <Text>money earn at the moment: {`${earns.toFixed(2)}`}$</Text>
          </Stack>
        </>
      )}
    </>
  );
}

export default ShiftInfo;
