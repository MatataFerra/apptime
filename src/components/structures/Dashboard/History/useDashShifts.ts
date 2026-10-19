"use client";

import { useEffect } from "react";

import isEmpty from "lodash/isEmpty";

import useDashboard from "@/hooks/useDashboard";
import useHourlyShifts from "@/hooks/useHourlyShifts";
import useProductionShifts from "@/hooks/useProductionShifts";

import { useDashHourlyStore } from "@/store/useDashHourlyStore";
import { useDashProductionStore } from "@/store/useDashProductionStore";

/**
 * Shifts shown in the Dashboard history: everything, or what the date
 * picker filtered. The stores are seeded from the queries until a range is picked.
 */
function useDashShifts() {
  const { data: hourlyData, isLoading: loadingHourly } = useHourlyShifts();
  const { data: productionData, isLoading: loadingProduction } = useProductionShifts();
  const { isDateFiltered } = useDashboard();
  const { hourly, setInitialHourlies } = useDashHourlyStore();
  const { productions, setInitialProductions } = useDashProductionStore();

  useEffect(() => {
    if (loadingHourly || isEmpty(hourlyData) || isDateFiltered) return;
    setInitialHourlies(hourlyData);
  }, [hourlyData, loadingHourly, isDateFiltered, setInitialHourlies]);

  useEffect(() => {
    if (loadingProduction || isEmpty(productionData) || isDateFiltered) return;
    setInitialProductions(productionData);
  }, [productionData, loadingProduction, isDateFiltered, setInitialProductions]);

  return {
    hourly: hourly ?? [],
    production: productions ?? [],
    isLoading: loadingHourly || loadingProduction,
    isDateFiltered,
  };
}

export default useDashShifts;
