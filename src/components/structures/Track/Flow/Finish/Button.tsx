import type { Hourly } from "@prisma/client";
import { useQueryClient } from "@tanstack/react-query";

import ShiftService from "@/services/Shift";
import HourlyService from "@/services/Shift/Hourly";
import Toast from "@/services/Toast";

import type { HourlyType } from "@/types";
import type { SuccessApiResponse } from "@/types/api_response";

import Button from "@/components/ui/Button";
import Loader from "@/components/ui/Loader";

import { USE_QUERY_KEYS } from "@/utils/constants/use-query";
import useTrack from "@/hooks/useTrack";
import useTrackShift from "@/hooks/useTrackShift";
import useUser from "@/hooks/useUser";

import onUpdateTrackJob from "@/server-actions/update-track";
import { useNotes } from "@/store/useNotesStore";
import { useShiftData } from "@/store/useShiftData";
import { useTrackTaxesOrContributionsStore } from "@/store/useTaxOrContributionStore";

type Props = {
  buttonStatus: {
    disabled: boolean;
    apply_variant: boolean;
  };
};

type Response = {
  shift: HourlyType;
  last: HourlyType[];
  earnings: number;
};

function FinishButton({ buttonStatus }: Props) {
  const queryClient = useQueryClient();
  const { removelocalNote, resetStoreNotes } = useNotes();
  const { data, resetShiftData } = useShiftData((state) => state);
  const { data: user } = useUser();
  const { data: track } = useTrackShift();

  const {
    taxesModule: { salaryElement: taxes, clear: clearTaxes },
  } = useTrackTaxesOrContributionsStore();

  const { updateShiftStatus, setIsClosing } = useTrack();

  function onFinishShift() {
    Toast({
      message: "Closing shift",
      type: "plain",
      description: "Updating status, please wait...",
      duration: 2000,
    });

    const previousTrack = queryClient.getQueryData<SuccessApiResponse<Response>>([
      USE_QUERY_KEYS.TRACK,
    ]);

    const prepareShift = {
      ...track.shift,
      name: data.name,
      shiftId: user?.shifts?.id,
    };

    const updateTrackedShift = new ShiftService({ ...prepareShift, isClosed: true })
      .closeShift()
      .differenceInMinsBetweenStartAndEnd()
      .checkPublicHoliday()
      .build<Hourly>();

    /*
     * Optimistic update
     */

    const prepareShiftToBeUpdated = {
      ...updateTrackedShift,
      taxes,
    };

    queryClient.cancelQueries({ queryKey: [USE_QUERY_KEYS.TRACK] });

    const calculateEarnings = new HourlyService(updateTrackedShift).calculateEarnings();

    queryClient.setQueryData([USE_QUERY_KEYS.TRACK], (old: SuccessApiResponse<Response>) => ({
      ...old,
      track: {
        shift: null,
        last: [{ ...prepareShiftToBeUpdated }],
        earnings: old.track.earnings + calculateEarnings,
      },
    }));

    /*
      server action
    */

    onUpdateTrackJob({ ...prepareShiftToBeUpdated }, track.shift?.id).then((response) => {
      // set closing to true
      setIsClosing(true);

      if (response) {
        removelocalNote();
        resetStoreNotes();
        resetShiftData();
        clearTaxes();

        Toast({
          message: "Shift updated",
          type: "success",
          description: "Your shift has been updated successfully",
          duration: 1000,
        });

        queryClient.invalidateQueries({ queryKey: [USE_QUERY_KEYS.TRACK] });
        queryClient.invalidateQueries({ queryKey: [USE_QUERY_KEYS.HOURLY] });

        return;
      }

      updateShiftStatus(true);
      // set closing to false
      setIsClosing(false);

      Toast({
        message: "Error",
        type: "error",
        description: "An error occurred while updating your shift",
        duration: 1000,
      });

      queryClient.invalidateQueries({ queryKey: [USE_QUERY_KEYS.TRACK] });
      queryClient.cancelQueries({ queryKey: [USE_QUERY_KEYS.TRACK] });

      queryClient.setQueryData([USE_QUERY_KEYS.TRACK], () => ({
        ...previousTrack,
      }));
    });
  }

  return (
    <>
      <Button
        variant="danger"
        classes="w-full animate-fade-up shadow-button transition-all active:shadow-button-inner"
        disabled={buttonStatus.disabled}
        onClick={onFinishShift}
      >
        Finish Shift
      </Button>
    </>
  );
}

export default FinishButton;
