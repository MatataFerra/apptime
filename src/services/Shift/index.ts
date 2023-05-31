import { Shift } from "@prisma/client";
import { differenceInMinutes, minutesToHours } from "date-fns";

type TypeShiftService = Omit<Shift, "id">;

/**
 * @class ShiftService
 * @description This class is responsible for all the logic related to the Shift model
 * @method differenceBetweenStartAndEnd - Calculates the difference between the start and end of a shift
 * @method convertAmountInDecimal - Converts the amount of minutes in decimal
 */
class ShiftService {
  /**
   * @description Calculates the difference between the start and end of a shift
   * @param shift
   * @returns {number}
   */
  static differenceBetweenStartAndEnd(shift: TypeShiftService): number {
    const start = new Date(shift.startDate);
    const end = new Date(shift?.endDate ?? "");
    const difference = differenceInMinutes(end, start);

    return difference;
  }

  static convertAmountInDecimal(amount: TypeShiftService["amount"]): number {
    const validAmount = amount ?? 0;
    return Math.round((validAmount / 60) * 100) / 100;
  }

  static shiftStatus(shift: TypeShiftService): boolean {
    if (!shift.endDate) return false;
    return shift.isClosed;
  }
}

export default ShiftService;
