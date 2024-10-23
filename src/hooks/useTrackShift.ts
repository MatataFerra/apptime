import { useCallback } from "react";

import { useQuery } from "@tanstack/react-query";

import apiHourly from "@/services/Api/Hourly";

import type { HourlyType } from "@/types";

import { USE_QUERY_KEYS } from "@/utils/constants/use-query";

export type TrackShiftResponseType = {
  shift: HourlyType;
  last: HourlyType;
  earnings: number;
};

function useTrackShift() {
  const fetchTrack = useCallback(async () => {
    return apiHourly.getTrack();
  }, []);

  const { data, isLoading, refetch, isFetched } = useQuery({
    queryKey: [USE_QUERY_KEYS.TRACK],
    queryFn: fetchTrack,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchInterval: 60 * 60 * 1000,
    staleTime: 2 * 60 * 1000,
  });

  return {
    data: data?.track as TrackShiftResponseType,
    isLoading,
    refetch,
    isFetched,
  };
}

export default useTrackShift;
