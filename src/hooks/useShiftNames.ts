import { useMemo } from "react";

import type { HourlyType, ProductionType } from "@/types";

type Shifts = {
  hourly: HourlyType[];
  production: ProductionType[];
};

/**
 * Job names used before that match what's being typed. Matching ignores
 * case, but names come back as they were first written ("Box Maker").
 */
function useShiftNames({ hourly, production }: Shifts, searchValue: string | null) {
  const names = useMemo(() => {
    const search = searchValue?.trim().toLowerCase() ?? "";
    const byKey = new Map<string, string>();

    for (const shift of [...(production ?? []), ...(hourly ?? [])]) {
      const name = shift.name?.trim();
      if (!name) continue;
      const key = name.toLowerCase();
      if (!byKey.has(key) && key.includes(search) && key !== search) byKey.set(key, name);
    }

    return Array.from(byKey.values());
  }, [searchValue, hourly, production]);

  return { names };
}

export default useShiftNames;
