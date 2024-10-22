import { useCallback, useMemo } from "react";

import { useQuery } from "@tanstack/react-query";

import apiHourly from "@/services/Api/Hourly";
import HourlyService from "@/services/Shift/Hourly";

import type { HourlyType } from "@/types";

import { USE_QUERY_KEYS } from "@/utils/constants/use-query";

function useHourlyShifts() {
  const fetchHourlies = useCallback(async () => {
    return apiHourly.getHourlies();
  }, []);

  const { data, isLoading, refetch, isFetched } = useQuery({
    queryKey: [USE_QUERY_KEYS.HOURLY],
    queryFn: fetchHourlies,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchInterval: 60 * 60 * 1000,
    staleTime: 2 * 60 * 1000,
  });

  const shiftUnclosed = useMemo(() => {
    if (!data?.hourly) return null;

    return HourlyService.findUnClosedShift(data.hourly);
  }, [data]);

  return {
    data: data?.hourly as HourlyType[],
    isLoading,
    refetch,
    isFetched,
    shiftUnclosed,
  };
}

export default useHourlyShifts;
