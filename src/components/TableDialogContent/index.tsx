import { Shift } from "@prisma/client";

import DateHumanizer from "@/services/Date";
import ShiftService from "@/services/Shift";

import Stack from "@/components/ui/Stack";
import Text from "@/components/ui/Text";

type Props = {
  shift: Shift;
};

const TYPE_SHIFT = {
  PRODUCTION: "Production",
  TRACK: "Hourly",
  FAST: "Hourly",
} as const;

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
        {shift.typeShift === "PRODUCTION" ? (
          <>
            <Text as="span" classes="font-bold">
              Item Value:
            </Text>{" "}
            {shift.itemValue ? `$${shift.itemValue}` : "..."}
          </>
        ) : (
          <>
            <Text as="span" classes="font-bold">
              Hours worked:
            </Text>{" "}
            {shift?.amount
              ? `${String(ShiftService.convertAmountInDecimal(shift?.amount ?? 0))}h`
              : "..."}
          </>
        )}
      </Text>
      {shift.typeShift === "PRODUCTION" ? (
        <Text>
          <Text as="span" classes="font-bold">
            Item Quantity:
          </Text>{" "}
          {shift.itemQuantity ? `${shift.itemQuantity}` : "..."}
        </Text>
      ) : null}
      <Text>
        <Text as="span" classes="font-bold">
          Earnings:
        </Text>{" "}
        {shift.typeShift === "PRODUCTION"
          ? `$${String(
              ShiftService.calculateProductionEarnings({
                itemValue: shift.itemValue,
                itemQuantity: shift.itemQuantity,
                holidayPayRate: shift.holidayPayRate,
                isPublicHoliday: shift.isPublicHoliday,
                publicHolidayWorked: shift.publicHolidayWorked,
              }).toFixed(2)
            )}`
          : `$${String(ShiftService.calculateEarnings({ shift }))}`}
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
      <Text>
        <Text as="span" classes="font-bold">
          Type of Shift:
        </Text>{" "}
        {shift?.typeShift ? TYPE_SHIFT[shift.typeShift as keyof typeof TYPE_SHIFT] : "..."}
      </Text>
    </Stack>
  );
}

export default TableDialogContent;
