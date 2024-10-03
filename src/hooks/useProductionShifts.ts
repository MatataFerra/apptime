import { useCallback } from "react";

import { useQuery } from "@tanstack/react-query";

import apiProduction from "@/services/Api/Production";

import type { ProductionType } from "@/types";

import { USE_QUERY_KEYS } from "@/utils/constants/use-query";

function useProductionShifts() {
  const fetchProductions = useCallback(async () => {
    return apiProduction.getProductions();
  }, []);

  const { data, isLoading, refetch, isFetched } = useQuery({
    queryKey: [USE_QUERY_KEYS.PRODUCTION],
    queryFn: fetchProductions,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchInterval: 60 * 60 * 1000,
    staleTime: 2 * 60 * 1000,
  });

  return { data: data?.production as ProductionType[], isLoading, refetch, isFetched };
}

export default useProductionShifts;
