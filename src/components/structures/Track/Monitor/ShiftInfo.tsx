"use client";

import DateHumanizer from "@/services/Date";
import ShiftService from "@/services/Shift";

import Stack from "@/components/ui/Stack";
import Text from "@/components/ui/Text";

import useTrack from "@/hooks/useTrack";

function ShiftTrackInfo() {
  const { user: getUser } = useTrack();

  const lastShift = getUser?.shifts?.hourly.at(-1);
  const dateHumanized = new DateHumanizer("long").humanizeDate(
    new Date(lastShift?.startDate ?? "")
  );
  const earnings = getUser?.shifts?.hourly.reduce((acc, shift) => {
    if (shift.isClosed) {
      acc += new ShiftService(shift).calculateEarnings();
    }

    return acc;
  }, 0);

  return (
    <>
      {getUser?.shifts?.hourly.length === 0 ? (
        <Text classes="mx-0 my-auto block text-center text-xl text-red-700">
          {"You haven't started your shift yet! Please press the 'Start Shift' button."}
        </Text>
      ) : (
        <Stack as="div" orientation="vertical">
          <Text classes="text-xl">{`Last shift tracked: ${dateHumanized ?? "no date available"}`}</Text>
          <Text classes="text-xl">Money earn at the moment: {`${earnings?.toFixed(2)}`}$</Text>
        </Stack>
      )}
    </>
  );
}

export default ShiftTrackInfo;
