import { Shift } from "@prisma/client";

import DateHumanizer from "@/services/Date";
import ShiftService from "@/services/Shift";

import Stack from "@/components/ui/Stack";
import Text from "@/components/ui/Text";

type Props = {
  shift: Shift;
};

function TableDialogContent({ shift }: Props) {
  return (
    <Stack grid cols={2}>
      <Text>
        <Text as="span" classes="font-bold">
          Start Date:
        </Text>{" "}
        {new DateHumanizer("short").humanizeDate(new Date(shift.startDate))}
      </Text>
      <Text>
        <Text as="span" classes="font-bold">
          End Date:
        </Text>{" "}
        {shift.endDate ? new DateHumanizer("short").humanizeDate(new Date(shift.endDate)) : "..."}
      </Text>
      <Text>
        <Text as="span" classes="font-bold">
          Hours worked:
        </Text>{" "}
        {shift?.amount
          ? `${String(ShiftService.convertAmountInDecimal(shift?.amount ?? 0))}h`
          : "..."}
      </Text>
      <Text>
        <Text as="span" classes="font-bold">
          Earnings:
        </Text>{" "}
        ${String(ShiftService.calculateEarnings({ shift }))}
      </Text>
      <Text>
        <Text as="span" classes="font-bold">
          Public Holiday:
        </Text>{" "}
        {shift?.isPublicHoliday ? "✅" : "❌"}
      </Text>

      <Text>
        <Text as="span" classes="font-bold">
          Hour Value:
        </Text>{" "}
        {shift?.hourValue ? `$${shift?.hourValue}` : "..."}
      </Text>

      <Text>
        <Text as="span" classes="font-bold">
          Holiday Pay Rate:
        </Text>{" "}
        {shift?.holidayPayRate ? `${shift?.holidayPayRate}%` : "..."}
      </Text>

      <Text>
        <Text as="span" classes="font-bold">
          Notes:
        </Text>{" "}
        {shift?.notes ? shift.notes : "..."}
      </Text>
    </Stack>
  );
}

export default TableDialogContent;
