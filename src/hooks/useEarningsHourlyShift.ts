import { useCallback } from "react";

import { useQuery } from "@tanstack/react-query";

import apiHourly from "@/services/Api/Hourly";

import { USE_QUERY_KEYS } from "@/utils/constants/use-query";

function useEarningsHourlyShift() {
  const fetchLastHourly = useCallback(async () => {
    return apiHourly.getEarnings();
  }, []);

  const { data, isLoading, refetch, isFetched } = useQuery({
    queryKey: [USE_QUERY_KEYS.EARN],
    queryFn: fetchLastHourly,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchInterval: 60 * 60 * 1000,
    staleTime: 2 * 60 * 1000,
  });

  return {
    data: data?.earnings as number | undefined,
    isLoading,
    refetch,
    isFetched,
  };
}

export default useEarningsHourlyShift;
