import { ChevronDownIcon } from "@radix-ui/react-icons";
import isEmpty from "lodash/isEmpty";

import DateHumanizer from "@/services/Date";
import Pay from "@/services/Pay";
import ShiftService from "@/services/Shift";

import type { ShiftType } from "@/types";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/Dropdown";
import Stack from "@/components/ui/Stack";
import Text from "@/components/ui/Text";

import { TYPE_SHIFT } from "@/utils/constants";
import { isProductionShift } from "@/utils/helpers/isProductionShift";

type Props = {
  shift: ShiftType;
};

function TableDialogContent({ shift }: Props) {
  return (
    <Stack grid cols={2}>
      {shift.name ? (
        <Text classes="col-span-2 border-b border-b-slate-500/40 text-lg text-ink">
          {shift.name}
        </Text>
      ) : null}
      <Text>
        <Text as="span" classes="font-bold">
          Start Date:
        </Text>{" "}
        {new DateHumanizer("short").humanizeDate(new Date(shift.startDate), {
          dateFormat: `d MMM 'of' yyyy',' 'from: ' HH:mm`,
        })}
      </Text>
      <Text>
        <Text as="span" classes="font-bold">
          End Date:
        </Text>{" "}
        {shift.endDate
          ? new DateHumanizer("short").humanizeDate(new Date(shift.endDate), {
              dateFormat: `d MMM 'of' yyyy',' 'to: ' HH:mm`,
            })
          : "..."}
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
          Notes:
        </Text>{" "}
        {shift?.notes ? shift.notes : "..."}
      </Text>
      <Text classes="col-span-2">
        <Text as="span" classes="font-bold">
          Type of Shift:
        </Text>{" "}
        {isProductionShift(shift) ? TYPE_SHIFT.PRODUCTION : TYPE_SHIFT.TRACK}
      </Text>
      <Text color="text-destructive">Gross pay: {`$${new Pay(shift).gross()?.toFixed(2)}`}</Text>
      {!!new Pay(shift).netPay() ? (
        <Text color="text-accent">Net pay: {`$${new Pay(shift).netPay()?.toFixed(2)}`}</Text>
      ) : null}
      {!isEmpty(shift.taxes) ? (
        <Stack>
          <DropdownMenu>
            <DropdownMenuTrigger className="group flex w-full items-center justify-between py-2 pr-4 text-xs text-ink">
              Taxes {`(${shift.taxes?.length ?? 0})`}
              <ChevronDownIcon className="transition-all group-data-[state=open]:rotate-180 group-data-[state=open]:transform" />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {shift.taxes?.map((tax) => (
                <DropdownMenuItem key={tax.id}>
                  {tax.name} {tax.value}%
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </Stack>
      ) : null}
    </Stack>
  );
}

export default TableDialogContent;
