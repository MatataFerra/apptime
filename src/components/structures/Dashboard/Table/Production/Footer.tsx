import { Production } from "@prisma/client";

import ProductionService from "@/services/Shift/Production";
import UserService from "@/services/User";

import TableElement from "@/components/ui/TableElement";
import TableFoot from "@/components/ui/TableFoot";

type Props = {
  colsNumber: number;
};

const MIN_COLS = 3;

async function ProductionFooter({ colsNumber }: Props) {
  const user = await UserService.getSessionUser();

  function calculateEarnings(shift: Production) {
    return ProductionService.earnings({
      holidayPayRate: shift?.holidayPayRate ?? 0,
      itemQuantity: shift?.itemQuantity ?? 0,
      itemValue: shift?.itemValue ?? 0,
      publicHolidayWorked: shift?.publicHolidayWorked ?? false,
    });
  }

  function totalEarnings() {
    return user?.shifts?.production.reduce((acc, shift) => acc + calculateEarnings(shift), 0);
  }

  function sumProduction() {
    return user?.shifts?.production.reduce((acc, shift) => {
      return acc + (shift?.itemQuantity ? shift.itemQuantity : 0);
    }, 0);
  }

  return (
    <>
      <TableFoot classes="bg-gray-100">
        <TableElement as="th" classes="text-left">
          Totals
        </TableElement>
        <TableElement>{`${sumProduction()?.toFixed(1)}`}</TableElement>
        <TableElement>${`${totalEarnings()?.toFixed(2)}`}</TableElement>
        {Array.from({ length: colsNumber - MIN_COLS }, (_, i) => (
          <TableElement key={i} />
        ))}
      </TableFoot>
    </>
  );
}

export default ProductionFooter;
