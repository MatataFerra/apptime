import { Shift } from "@prisma/client";

import { UserType } from "@/types";

import Stack from "@/components/ui/Stack";
import Text from "@/components/ui/Text";

type Props = {
  shift: Shift;
  user: UserType | null | undefined;
  shortDate: (date: string) => string;
  getHours: (amount: number) => number;
  calculateEarnings: (shift: Shift) => number;
};

function TableDialogContent({ shift, user, shortDate, getHours, calculateEarnings }: Props) {
  return (
    <Stack grid cols={2}>
      <Text>
        <Text as="span" classes="font-bold">
          Start Date:
        </Text>{" "}
        {shortDate(shift.startDate)}
      </Text>
      <Text>
        <Text as="span" classes="font-bold">
          End Date:
        </Text>{" "}
        {shift.endDate ? shortDate(shift.endDate) : "..."}
      </Text>
      <Text>
        <Text as="span" classes="font-bold">
          Hours worked:
        </Text>{" "}
        {shift?.amount ? `${String(getHours(shift?.amount ?? 0))}h` : "..."}
      </Text>
      <Text>
        <Text as="span" classes="font-bold">
          Earnings:
        </Text>{" "}
        ${String(calculateEarnings(shift))}
      </Text>
      <Text>
        <Text as="span" classes="font-bold">
          Public Holiday:
        </Text>{" "}
        {shift?.isPublicHoliday ? "✅" : "❌"}
      </Text>

      <Text>
        <Text as="span" classes="font-bold">
          Hourly Rate:
        </Text>{" "}
        {shift?.hourValue ? `$${shift?.hourValue}` : "..."}
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
