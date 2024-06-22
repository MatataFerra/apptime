import { useEffect, useState } from "react";

import type { TaxHourlySaved, TaxProductionSaved } from "@prisma/client";

import { type UserType } from "@/types";

type TaxSaved = TaxHourlySaved | TaxProductionSaved;

/**
 * @description Custom hook to get the saved taxes. It maps the user and the type of shift and returns the saved taxes
 * @param {UserType} user
 * @param {"production" | "hourly"} type
 * @returns {TaxSaved[]}
 */
function useSavedTax(user: UserType | undefined, type: "production" | "hourly") {
  const [savedTaxesFromDB, setSavedTaxesFromDB] = useState<TaxSaved[]>([]);

  useEffect(() => {
    switch (type) {
      case "production":
        if (!user?.config?.taxSaved?.productionTaxes) return;
        setSavedTaxesFromDB(user?.config?.taxSaved?.productionTaxes);
        break;
      case "hourly":
        if (!user?.config?.taxSaved?.hourlyTaxes) return;
        setSavedTaxesFromDB(user?.config?.taxSaved?.hourlyTaxes);
        break;
      default:
        break;
    }
  }, [type, user?.config?.taxSaved?.hourlyTaxes, user?.config?.taxSaved?.productionTaxes]);

  return savedTaxesFromDB;
}

export default useSavedTax;
