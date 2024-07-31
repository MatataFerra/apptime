import type { Hourly } from "@prisma/client";
import { useQueryClient } from "@tanstack/react-query";

import ShiftService from "@/services/Shift";
import Toast from "@/services/Toast";

import Button from "@/components/ui/Button";
import Loader from "@/components/ui/Loader";

import useTrack from "@/hooks/useTrack";

import onUpdateTrackJob from "@/server-actions/update-track";
import { useNotes } from "@/store/useNotesStore";
import { useTrackTaxesStore } from "@/store/useTaxStore";

type Props = {
  buttonStatus: {
    disabled: boolean;
    apply_variant: boolean;
  };
};

function FinishButton({ buttonStatus }: Props) {
  const queryClient = useQueryClient();
  const { removelocalNote } = useNotes();
  const { taxes } = useTrackTaxesStore();

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
    const updateTrackedShift = new ShiftService({ ...currentShift, isClosed: true })
      .closeShift()
      .differenceInMinsBetweenStartAndEnd()
      .checkPublicHoliday()
      .build<Hourly>();

    /*
     * Optimistic update
     */

    updateShift({ ...updateTrackedShift });

    /*
      server action
    */

    onUpdateTrackJob({ ...updateTrackedShift }, taxes, shift?.id).then((response) => {
      Toast({
        message: "Closing shift",
        type: "plain",
        description: "Updating status, please wait...",
        action: <Loader.spinner bg="text-black" spinColor="fill-slate-100" />,
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
          action: <Loader.spinner bg="text-black" spinColor="fill-gray-50" />,
          duration: 1000,
        });

        queryClient.refetchQueries({ queryKey: ["user", user?.email] });

        return;
      }

      updateShiftsInfo();
      updateShiftUnclosed();
      updateShiftStatus(true);
      updateShift({ ...currentShift });
      // set closing to false
      setIsClosing(false);

      Toast({
        message: "Error",
        type: "error",
        description: "An error occurred while updating your shift",
        action: <Loader.spinner bg="text-black" spinColor="fill-gray-50" />,
        duration: 1000,
      });

      queryClient.refetchQueries({ queryKey: ["user", user?.email] });
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
