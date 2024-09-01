import { useMemo } from "react";

import type { UserType } from "@/types";

function useShiftNames(user: UserType, searchValue: string | null) {
  const getShiftsNames = useMemo(() => {
    const getHourlyShiftNames =
      user?.shifts?.hourly.map((shift) => shift.name).filter((shift) => shift !== null) ?? [];

    const getProductionShiftNames =
      user?.shifts?.production.map((shift) => shift.name).filter((shift) => shift !== null) ?? [];

    const allValues = [...getProductionShiftNames, ...getHourlyShiftNames].filter((value) =>
      value.toLowerCase().includes(searchValue?.toLowerCase() ?? "")
    );

    const uniqueNames = new Set(allValues);

    return Array.from(uniqueNames);
  }, [searchValue, user?.shifts?.hourly, user?.shifts?.production]);

  return {
    names: getShiftsNames,
  };
}

export default useShiftNames;
