import { useMemo } from "react";

import type { HourlyType, ProductionType } from "@/types";

type Shifts = {
  hourly: HourlyType[];
  production: ProductionType[];
};

function useShiftNames({ hourly, production }: Shifts, searchValue: string | null) {
  const getShiftsNames = useMemo(() => {
    const getHourlyShiftNames =
      hourly?.map((shift) => shift.name?.toLowerCase() ?? "").filter((shift) => shift !== null) ??
      [];

    const getProductionShiftNames =
      production
        ?.map((shift) => shift.name?.toLowerCase() ?? "")
        .filter((shift) => shift !== null) ?? [];

    const allValues = [...getProductionShiftNames, ...getHourlyShiftNames].filter((value) =>
      value?.toLowerCase().includes(searchValue?.toLowerCase() ?? "")
    );

    const uniqueNames = new Set(allValues);

    return Array.from(uniqueNames);
  }, [searchValue, hourly, production]);

  return {
    names: getShiftsNames,
  };
}

export default useShiftNames;
