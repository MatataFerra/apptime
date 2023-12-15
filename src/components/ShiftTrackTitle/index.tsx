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
        {!!shift ? `Current shift time: ${text}` : "No shift is tracked"}
      </Text>
    </>
  );
}

export default ShiftTrackTitle;
