import type { Tax } from "@prisma/client";

import HourlyService from "@/services/Shift/Hourly";
import ProductionService from "@/services/Shift/Production";

import type { ProductionType, SalaryItemInput,ShiftType } from "@/types";

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
    return this.afterTaxes();
  }

  payContributions() {
    const netAfterTaxes = this.afterTaxes();
    return (
      this.shift.contributions?.reduce((acc, contrib) => {
        const value = Number(contrib.value);
        const prepareContribution = (acc * value) / 100;

        return acc + prepareContribution;
      }, netAfterTaxes) ?? 0
    );
  }

  afterTaxes() {
    const gross = this.gross();
    return (
      this.shift.taxes?.reduce((acc, tax) => {
        const value = Number(tax.value);
        const prepareTax = (acc * value) / 100;

        return acc - prepareTax;
      }, gross) ?? gross
    );
  }

  static afterTax(gross: number, taxes: SalaryItemInput[]) {
    return (
      taxes?.reduce((acc, tax) => {
        const value = Number(tax.value);
        const prepareTax = (acc * value) / 100;

        return acc - prepareTax;
      }, gross) ?? gross
    );
  }
}

export default Pay;
