import type { Hourly } from "@prisma/client";
import { useQueryClient } from "@tanstack/react-query";

import ShiftService from "@/services/Shift";
import Toast from "@/services/Toast";

import Button from "@/components/ui/Button";
import Loader from "@/components/ui/Loader";

import { invalidateShiftQueries } from "@/utils/helpers/invalidateShiftQueries";
import useTrack from "@/hooks/useTrack";

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

function FinishButton({ buttonStatus }: Props) {
  const queryClient = useQueryClient();
  const { removelocalNote } = useNotes();
  const { data } = useShiftData((state) => state);
  const {
    taxesModule: { salaryElement: taxes },
    contributionsModule: { salaryElement: contributions },
  } = useTrackTaxesOrContributionsStore();

  const {
    user,
    updateShiftsInfo,
    updateShiftStatus,
    updateShiftUnclosed,
    updateShift,
    getShift,
    setIsClosing,
    shiftUnclosed: { shift },
  } = useTrack();

  function onFinishShift() {
    const currentShift = getShift(shift?.id);
    const prepareShift = {
      ...currentShift,
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

    updateShift({ ...updateTrackedShift });

    const prepareShiftToBeUpdated = {
      ...updateTrackedShift,
      taxes,
      contributions,
    };

    /*
      server action
    */

    onUpdateTrackJob({ ...prepareShiftToBeUpdated }, shift?.id).then((response) => {
      Toast({
        message: "Closing shift",
        type: "plain",
        description: "Updating status, please wait...",
        action: <Loader.spinner bg="text-ink" spinColor="fill-slate-100" />,
        duration: 2000,
      });

      // set closing to true
      setIsClosing(true);
      updateShiftsInfo();
      updateShiftUnclosed();
      updateShiftStatus(false);

      if (response) {
        removelocalNote();

        Toast({
          message: "Shift updated",
          type: "success",
          description: "Your shift has been updated successfully",
          action: <Loader.spinner bg="text-ink" spinColor="fill-ink" />,
          duration: 1000,
        });

        invalidateShiftQueries(queryClient);

        return;
      }

      updateShiftsInfo();
      updateShiftUnclosed();
      updateShiftStatus(true);
      updateShift({ ...prepareShift });
      // set closing to false
      setIsClosing(false);

      Toast({
        message: "Error",
        type: "error",
        description: "An error occurred while updating your shift",
        action: <Loader.spinner bg="text-ink" spinColor="fill-ink" />,
        duration: 1000,
      });

      invalidateShiftQueries(queryClient);
    });
  }

  return (
    <>
      <Button
        variant="primary"
        classes="h-14 w-full animate-fade-up rounded-lg text-base font-semibold"
        disabled={buttonStatus.disabled}
        onClick={onFinishShift}
      >
        Finish Shift
      </Button>
    </>
  );
}

export default FinishButton;
