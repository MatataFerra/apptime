import { Shift } from "@prisma/client";

import ShiftService from "@/services/Shift";
import UserService from "@/services/User";

import TableElement from "@/components/ui/TableElement";
import TableFoot from "@/components/ui/TableFoot";

type Props = {
  colsNumber: number;
};

const EMPTY_COLS = 2;

async function TableHistoryFoot({ colsNumber }: Props) {
  const user = await UserService.getSessionUser();

  function calculateEarnings(shift: Shift) {
    return ShiftService.calculateEarnings({ shift });
  }

  function getHours(minutes: number) {
    return ShiftService.convertAmountInDecimal(minutes);
  }

  function totalEarnings() {
    return user?.shifts.reduce((acc, shift) => acc + calculateEarnings(shift), 0);
  }

  function sumHours() {
    return user?.shifts.reduce((acc, shift) => {
      return acc + (shift?.amount ? getHours(shift?.amount ?? 0) : 0);
    }, 0);
  }

  return (
    <TableFoot classes="bg-gray-100">
      <TableElement as="th" classes="text-left">
        Totals
      </TableElement>
      <TableElement>{`${sumHours()?.toFixed(2)}`}h</TableElement>
      <TableElement>${`${totalEarnings()?.toFixed(2)}`}</TableElement>
      {Array.from({ length: colsNumber - EMPTY_COLS }, (_, i) => (
        <TableElement key={i} />
      ))}
    </TableFoot>
  );
}

export default TableHistoryFoot;
