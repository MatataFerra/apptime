import type { Hourly } from "@prisma/client";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import ShiftService from "@/services/Shift";
import Toast from "@/services/Toast";

import type { UserType } from "@/types";

import { cancelTrackQuery, optimisticTrack } from "@/components/structures/Track/optimistic";
import Button from "@/components/ui/Button";
import Loader from "@/components/ui/Loader";

import useTrack from "@/hooks/useTrack";

import onUpdateTrackJob from "@/server-actions/update-track";
import { useTrackTaxesStore } from "@/store/useTaxStore";

type Props = {
  buttonStatus: {
    disabled: boolean;
    apply_variant: boolean;
  };
};

function FinishButton({ buttonStatus }: Props) {
  const queryClient = useQueryClient();
  const { taxes } = useTrackTaxesStore();
  const router = useRouter();

  const {
    user,
    updateShiftsInfo,
    updateShiftStatus,
    updateShiftUnclosed,
    updateShift,
    getShift,
    shiftUnclosed: { shift },
  } = useTrack();

  function onFinishShift() {
    const currentShift = getShift(shift?.id);
    const updateTrackedShift = new ShiftService({ ...currentShift })
      .closeShift()
      .differenceInMinsBetweenStartAndEnd()
      .checkPublicHoliday()
      .build<Hourly>();

    /*
     * Optimistic update
     */

    optimisticTrack(updateTrackedShift as Hourly, user as UserType, queryClient);
    updateShift({ ...updateTrackedShift });

    /*
      server action
    */

    onUpdateTrackJob({ ...shift }, taxes, shift?.id).then((response) => {
      Toast({
        message: "Closing shift",
        type: "plain",
        description: "Updating status, please wait...",
        action: <Loader.spinner bg="text-black" spinColor="fill-slate-100" />,
        duration: 2000,
      });
      updateShiftsInfo();
      updateShiftUnclosed();
      updateShiftStatus(false);

      if (response) {
        queryClient.invalidateQueries({ queryKey: ["user", user?.email] });
        router.refresh();

        Toast({
          message: "Shift updated",
          type: "success",
          description: "Your shift has been updated successfully",
          action: <Loader.spinner bg="text-black" spinColor="fill-gray-50" />,
          duration: 1000,
        });

        return;
      }

      setTimeout(() => {
        updateShiftsInfo();
        updateShiftUnclosed();
        updateShiftStatus(true);
        cancelTrackQuery(user as UserType, queryClient);
        updateShift({ ...currentShift });
      }, 1500);

      Toast({
        message: "Error",
        type: "error",
        description: "An error occurred while updating your shift",
        action: <Loader.spinner bg="text-black" spinColor="fill-gray-50" />,
        duration: 1000,
      });
    });
  }

  return (
    <>
      <Button
        variant="danger"
        classes="w-full shadow-button active:shadow-button-inner"
        disabled={buttonStatus.disabled}
        onClick={onFinishShift}
      >
        Finish Shift
      </Button>
    </>
  );
}

export default FinishButton;
