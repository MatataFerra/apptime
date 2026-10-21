import { useCallback } from "react";

import { useQuery } from "@tanstack/react-query";

import apiHourly from "@/services/Api/Hourly";

import type { HourlyType } from "@/types";

import { useAuthSession } from "@/providers/Session";

import { USE_QUERY_KEYS } from "@/utils/constants/use-query";

function useHourlyShifts() {
  const fetchHourlies = useCallback(async () => {
    return apiHourly.getHourlies();
  }, []);

  // Signed out (e.g. Home after logging out) there's nothing to fetch.
  const { isSignedIn } = useAuthSession();

  const { data, isLoading, refetch, isFetched } = useQuery({
    queryKey: [USE_QUERY_KEYS.HOURLY],
    queryFn: fetchHourlies,
    enabled: isSignedIn,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchInterval: 60 * 60 * 1000,
    staleTime: 2 * 60 * 1000,
  });

  return { data: data?.hourly as HourlyType[], isLoading, refetch, isFetched };
}

export default useHourlyShifts;
