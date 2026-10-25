import { useCallback } from "react";

import { useQuery } from "@tanstack/react-query";

import apiProduction from "@/services/Api/Production";

import type { ProductionType } from "@/types";

import { useAuthSession } from "@/providers/Session";

import { USE_QUERY_KEYS } from "@/utils/constants/use-query";

function useProductionShifts() {
  const fetchProductions = useCallback(async () => {
    return apiProduction.getProductions();
  }, []);

  // Signed out (e.g. Home after logging out) there's nothing to fetch.
  const { isSignedIn } = useAuthSession();

  const { data, isLoading, refetch, isFetched } = useQuery({
    queryKey: [USE_QUERY_KEYS.PRODUCTION],
    queryFn: fetchProductions,
    enabled: isSignedIn,
    refetchOnWindowFocus: false,
    refetchInterval: 60 * 60 * 1000,
    staleTime: 2 * 60 * 1000,
  });

  return { data: data?.production as ProductionType[], isLoading, refetch, isFetched };
}

export default useProductionShifts;
