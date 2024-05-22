import DateHumanizer from "@/services/Date";
import ShiftService from "@/services/Shift";
import UserService from "@/services/User";

import Stack from "@/components/ui/Stack";
import Text from "@/components/ui/Text";

async function ShiftTrackInfo() {
  const getUser = await UserService.getSessionUser();

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
          <Text classes="text-sm">{`last shift tracked: ${dateHumanized ?? "no date available"}`}</Text>
          <Text classes="text-sm">total shifts tracked: {getUser?.shifts?.hourly.length}</Text>
          <Text classes="text-sm">money earn at the moment: {`${earnings?.toFixed(2)}`}$</Text>
        </Stack>
      )}
    </>
  );
}

export default ShiftTrackInfo;
