import { Hourly, Production } from "@prisma/client";

export function isProductionShift(shift: Production | Hourly): shift is Production {
  return "itemQuantity" in shift;
}
