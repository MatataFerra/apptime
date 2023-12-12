import { Profile, Shift } from "@prisma/client";

import DateHumanizer from "@/services/Date";
import ShiftService from "@/services/Shift";

import Stack from "@/components/ui/Stack";
import Text from "@/components/ui/Text";

type Props = {
  shifts: Shift[] | undefined;
  profile: Profile | undefined | null;
};

function ShiftInfo({ shifts, profile }: Props) {
  const sort = shifts?.toSorted((a, b) => {
    if (!a.isClosed || !b.isClosed) return 0;

    return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
  })[0];

  const humanizeDate = new DateHumanizer("today").humanizeDate(
    new Date(sort?.startDate ?? "") ?? Date.now()
  );

  const costMinute = profile?.hourlyRate ? profile?.hourlyRate / 60 : 1;
  const dateHumanized = shifts?.reduce((acc, _) => {
    const { diff, text } = ShiftService.differenceInHHmm(
      new Date(sort?.startDate ?? ""),
      new Date(sort?.endDate ?? "")
    );

    const earns = acc.earns + diff * costMinute

    return {
      earns: earns,
      text: text
    };
  }, {
    earns: 0,
    text: ''
  });

  return (
    <Stack as="div" orientation="vertical">
      <Text>last shift tracked: {`${dateHumanized?.text} (${humanizeDate})`}</Text>
      <Text>money earn at the moment: {`${dateHumanized?.earns}`}$</Text>
    </Stack>
  );
}

export default ShiftInfo;
