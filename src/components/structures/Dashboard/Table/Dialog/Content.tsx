import type { Hourly, Production } from "@prisma/client";

import DateHumanizer from "@/services/Date";
import ShiftService from "@/services/Shift";
import ProductionService from "@/services/Shift/Production";

import Stack from "@/components/ui/Stack";
import Text from "@/components/ui/Text";

import { TYPE_SHIFT } from "@/utils/constants";
import { isProductionShift } from "@/utils/helpers/isProductionShift";

type Props = {
  shift: Production | Hourly;
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
        {isProductionShift(shift) ? (
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
      {isProductionShift(shift) ? (
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
        {isProductionShift(shift)
          ? `$${String(
              ProductionService.earnings({
                itemValue: shift.itemValue,
                itemQuantity: shift.itemQuantity,
                holidayPayRate: shift.holidayPayRate,
                publicHolidayWorked: shift.publicHolidayWorked,
              }).toFixed(2)
            )}`
          : `$${String(new ShiftService(shift).calculateEarnings())}`}
      </Text>
      <Text>
        <Text as="span" classes="font-bold">
          Public Holiday:
        </Text>{" "}
        {shift?.isPublicHoliday ? "✅" : "❌"}
      </Text>

      {!isProductionShift(shift) ? (
        <Text>
          <Text as="span" classes="font-bold">
            Hour Value:
          </Text>{" "}
          {shift?.hourValue ? `$${shift?.hourValue}` : "..."}
        </Text>
      ) : null}

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
        {isProductionShift(shift) ? TYPE_SHIFT.PRODUCTION : TYPE_SHIFT.TRACK}
      </Text>
    </Stack>
  );
}

export default TableDialogContent;
