import { useCallback } from "react";

import { useQuery } from "@tanstack/react-query";

import apiHourly from "@/services/Api/Hourly";
import ShiftService from "@/services/Shift";

import type { HourlyType } from "@/types";

import { USE_QUERY_KEYS } from "@/utils/constants/use-query";

export type TrackShiftResponseType = {
  shift: HourlyType;
  last: HourlyType;
  earnings: number;
};

function useTrackShift() {
  const fetchTrack = useCallback(async () => {
    const data = await apiHourly.getTrack();

    const trackShift = data?.track?.find((shift) => shift.endDate === null) ?? null;

    const orderShifts = ShiftService.sortAllShifts(
      data?.track?.map((s) => ({ ...s, type: "hourly" })),
      {
        desc: false,
      }
    );

    const last = orderShifts?.filter((shift) => shift.endDate !== null).at(-1);

    const earnings = data?.track?.reduce((acc, shift) => {
      if (shift?.isClosed) {
        acc += new ShiftService(shift).calculateEarnings();
      }

      return acc;
    }, 0);

    return {
      track: {
        shift: trackShift,
        last,
        earnings,
      },
    };
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
