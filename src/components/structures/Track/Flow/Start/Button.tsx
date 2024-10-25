"use client";

import { useQueryClient } from "@tanstack/react-query";
import isEmpty from "lodash/isEmpty";
import { useRouter } from "next/navigation";

import Toast from "@/services/Toast";

import type { HourlyType } from "@/types";
import type { SuccessApiResponse } from "@/types/api_response";

import Button from "@/components/ui/Button";
import { DialogClose } from "@/components/ui/Dialog";

import { USE_QUERY_KEYS } from "@/utils/constants/use-query";
import useTrack from "@/hooks/useTrack";
import useUser from "@/hooks/useUser";

import onCreateTrackJob from "@/server-actions/create-track";
import { useShiftData } from "@/store/useShiftData";

type Props = {
  title?: string;
};

function ShiftStartButton({ title = "Save config & start" }: Props) {
  const { data, errors } = useShiftData((state) => state);
  const router = useRouter();
  const { data: user } = useUser();
  const queryClient = useQueryClient();
  const { updateShiftStatus, setIsClosing } = useTrack();

  function onStartShift() {
    Toast({
      message: "Shift is being created",
      type: "info",
    });

    updateShiftStatus(true);

    const previousTrack = queryClient.getQueryData<SuccessApiResponse<HourlyType>>([
      USE_QUERY_KEYS.TRACK,
    ]);

    const previousHourlies = queryClient.getQueryData<SuccessApiResponse<HourlyType[]>>([
      USE_QUERY_KEYS.HOURLY,
    ]);

    const prepareShift = {
      ...data,
      startDate: new Date().toString(),
      endDate: null,
      isClosed: false,
      shiftId: user?.shifts?.id ?? null,
    };

    //* optimistic update

    queryClient.cancelQueries({ queryKey: [USE_QUERY_KEYS.TRACK] });

    queryClient.setQueryData([USE_QUERY_KEYS.TRACK], (old: SuccessApiResponse<HourlyType>) => ({
      ...old,
      track: {
        ...old.track,
        shift: {
          ...prepareShift,
        },
      },
    }));

    setIsClosing(false);

    onCreateTrackJob({
      startDate: new Date().toString(),
      endDate: null,
      name: data.name,
      amount: 0,
      notes: "",
      isClosed: false,
      isPublicHoliday: data.isPublicHoliday,
      publicHolidayWorked: data.publicHolidayWorked,
      hourValue: Number(data.hourValue),
      unpaidBreaks: Number(data.unpaidBreaks),
      shiftId: user?.shifts?.id as number | null,
    }).then((response) => {
      if (response?.response) {
        Toast({
          message: "Shift started",
          type: "success",
        });

        queryClient.invalidateQueries({ queryKey: [USE_QUERY_KEYS.TRACK] });

        queryClient.cancelQueries({ queryKey: [USE_QUERY_KEYS.HOURLY] });

        if (!isEmpty(previousHourlies)) {
          queryClient.setQueryData(
            [USE_QUERY_KEYS.HOURLY],
            (old: SuccessApiResponse<HourlyType[]>) => ({
              ...old,
              hourly: [...old.hourly, { ...response.shift }],
            })
          );
        }

        queryClient.invalidateQueries({ queryKey: [USE_QUERY_KEYS.HOURLY] });

        router.refresh();

        return;
      }

      Toast({
        message: "Error creating shift, please try again",
        type: "error",
      });

      queryClient.invalidateQueries({ queryKey: [USE_QUERY_KEYS.TRACK] });

      queryClient.cancelQueries({ queryKey: [USE_QUERY_KEYS.TRACK] });
      queryClient.setQueryData([USE_QUERY_KEYS.TRACK], () => ({
        ...previousTrack,
      }));

      if (!isEmpty(previousHourlies)) {
        queryClient.invalidateQueries({ queryKey: [USE_QUERY_KEYS.HOURLY] });
        queryClient.cancelQueries({ queryKey: [USE_QUERY_KEYS.HOURLY] });

        queryClient.setQueryData([USE_QUERY_KEYS.HOURLY], () => ({
          ...previousHourlies,
        }));
      }

      updateShiftStatus(false);
      setIsClosing(true);
    });
  }

  return (
    <DialogClose asChild>
      <Button
        variant="black"
        disabled={errors}
        type="submit"
        classes="w-full border border-transparent p-2 text-sm"
        onClick={onStartShift}
      >
        {title}
      </Button>
    </DialogClose>
  );
}

export default ShiftStartButton;
