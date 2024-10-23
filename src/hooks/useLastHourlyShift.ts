import { useCallback } from "react";

import { useQuery } from "@tanstack/react-query";

import apiHourly from "@/services/Api/Hourly";

import type { HourlyType } from "@/types";

import { USE_QUERY_KEYS } from "@/utils/constants/use-query";

function useLastHourlyShift() {
  const fetchLastHourly = useCallback(async () => {
    return apiHourly.getLast();
  }, []);

  const { data, isLoading, refetch, isFetched } = useQuery({
    queryKey: [USE_QUERY_KEYS.LAST],
    queryFn: fetchLastHourly,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchInterval: 60 * 60 * 1000,
    staleTime: 2 * 60 * 1000,
  });

  return {
    data: data?.last as HourlyType[] | undefined,
    isLoading,
    refetch,
    isFetched,
  };
}

export default useLastHourlyShift;
