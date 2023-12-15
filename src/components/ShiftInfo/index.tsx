"use client";

import { Profile, Shift } from "@prisma/client";

import Stack from "@/components/ui/Stack";
import Text from "@/components/ui/Text";

import Loader from "../ui/Loader";
import { useShiftStateContext } from "@/store/useShiftStatusStore";

type Props = {
  shifts: Shift[] | undefined;
  profile: Profile | undefined | null;
};

function ShiftInfo({ shifts, profile }: Props) {
  const { date, earns, text, isLoading } = useShiftStateContext((state) => state.shiftsInfo);

  return (
    <>
      {isLoading ? (
        <Loader.spinner containerClasses="flex w-full h-full justify-center items-center" />
      ) : (
        <>
          <Stack as="div" orientation="vertical">
            <Text>last shift tracked: {`${text} (${date})`}</Text>
            <Text>money earn at the moment: {`${earns}`}$</Text>
          </Stack>
        </>
      )}
    </>
  );
}

export default ShiftInfo;
