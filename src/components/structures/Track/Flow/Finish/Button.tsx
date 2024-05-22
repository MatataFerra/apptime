import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import api from "@/services/Api/Shift";
import Toast from "@/services/Toast";

import Button from "@/components/ui/Button";
import Loader from "@/components/ui/Loader";

import { useShiftStateContext } from "@/store/useShiftStatusStore";

type Props = {
  buttonStatus: {
    disabled: boolean;
    apply_variant: boolean;
  };
};

function FinishButton({ buttonStatus }: Props) {
  const queryClient = useQueryClient();
  const router = useRouter();

  const {
    user,
    getShift,
    updateShiftsInfo,
    updateShiftStatus,
    updateShiftUnclosed,
    shiftUnclosed: { shift },
  } = useShiftStateContext((state) => state);

  const mutate = useMutation({
    mutationFn: api.updateHourly.bind(api),
    onSuccess: (_) => {
      updateShiftsInfo();
      updateShiftUnclosed();
      queryClient.invalidateQueries({ queryKey: ["user", user?.email] });
      router.refresh();
      Toast({
        message: "Shift updated",
        type: "success",
        description: "Your shift has been updated successfully",
        action: <Loader.spinner bg="text-black" spinColor="fill-gray-50" />,
        duration: 1000,
      });
    },
    onError: () => {
      Toast({
        message: "Error",
        type: "error",
        description: "An error occurred while updating your shift",
        action: <Loader.spinner bg="text-black" spinColor="fill-gray-50" />,
        duration: 1000,
      });
    },
    gcTime: 1000,
  });

  function onFinishShift() {
    Toast({
      message: "Closing shift",
      type: "plain",
      description: "Updating status, please wait...",
      action: <Loader.spinner bg="text-black" spinColor="fill-slate-100" />,
      duration: 2000,
    });
    const updateShift = getShift(shift?.id);
    mutate.mutate({
      body: {
        ...updateShift,
        amount: updateShift?.amount,
        endDate: updateShift?.endDate,
        isClosed: true,
        isPublicHoliday: updateShift?.isPublicHoliday,
        notes: updateShift?.notes,
        publicHolidayWorked: updateShift?.publicHolidayWorked,
        startDate: updateShift?.startDate,
        unpaidBreaks: updateShift?.unpaidBreaks,
      },
      id: updateShift?.id,
    });
    updateShiftStatus(false);
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
