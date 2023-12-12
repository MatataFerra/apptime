import { Shift } from "@prisma/client";

import ShiftService from "@/services/Shift";

import Text from "@/components/ui/Text";

type Props = {
  shift: Shift | null | undefined;
};

function ShiftTrackTitle({ shift }: Props) {
  const { text } = ShiftService.differenceInHHmm(shift?.startDate ?? "", shift?.endDate ?? "");

  return (
    <>
      <Text classes="text-2xl">
        {shift?.isClosed ? "No shift is tracked" : `Current shift time: ${text}`}
      </Text>
    </>
  );
}

export default ShiftTrackTitle;
