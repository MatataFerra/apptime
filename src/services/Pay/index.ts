import HourlyService from "@/services/Shift/Hourly";
import ProductionService from "@/services/Shift/Production";

import type { ProductionType, ShiftType } from "@/types";

type Shift = ShiftType;

interface PayInterface {
  shift: Shift;
}

class Pay implements PayInterface {
  shift: Shift;
  constructor(shift: Shift) {
    this.shift = shift;
  }

  isProductionShift(shift: ShiftType): shift is ProductionType {
    return "itemQuantity" in shift;
  }

  gross() {
    let earnings = 0;
    if (this.isProductionShift(this.shift)) {
      earnings = new ProductionService(this.shift).calculateEarnings();
    } else {
      earnings = new HourlyService(this.shift).calculateEarnings();
    }

    return earnings;
  }

  netPay() {
    return this.shift.taxes?.reduce((acc, tax) => {
      const value = Number(tax.value);
      const prepareTax = (this.gross() * value) / 100;
      return (acc -= prepareTax);
    }, this.gross());
  }
}

export default Pay;
