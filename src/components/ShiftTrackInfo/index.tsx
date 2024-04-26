import { useQuery } from "@tanstack/react-query";

import api from "@/services/Api";
import DateHumanizer from "@/services/Date";
import ShiftService from "@/services/Shift";

import { UserType } from "@/types";

import Stack from "@/components/ui/Stack";
import Text from "@/components/ui/Text";

import useUser from "@/hooks/useUser";

function ShiftTrackInfo() {
  const { data: user } = useUser();
  const { data } = useQuery({
    queryKey: ["user", user?.email],
    queryFn: () =>
      api.getUserByEmail.bind(api)({
        email: user?.email,
        shifts: true,
        profile: true,
        hasEnvUrl: false,
      }),
  });

  const getUser = data?.user as UserType;

  const lastShift = getUser?.shifts.at(-1);
  const dateHumanized = new DateHumanizer("long").humanizeDate(
    new Date(lastShift?.startDate ?? "")
  );
  const earnings = getUser?.shifts.reduce((acc, shift) => {
    if (shift.isClosed) {
      acc += ShiftService.calculateEarnings({ shift });
    }

    return acc;
  }, 0);

  return (
    <>
      {getUser?.shifts.length === 0 ? (
        <Text classes="mx-0 my-auto block text-center text-xl text-red-700">
          {"You haven't started your shift yet! Please press the 'Start Shift' button."}
        </Text>
      ) : (
        <Stack as="div" orientation="vertical">
          <Text>{`last shift tracked: ${dateHumanized ?? "no date available"}`}</Text>
          <Text>total shifts tracked: {getUser?.shifts.length}</Text>
          <Text>money earn at the moment: {`${earnings?.toFixed(2)}`}$</Text>
        </Stack>
      )}
    </>
  );
}

export default ShiftTrackInfo;
