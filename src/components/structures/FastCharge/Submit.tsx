"use client";

import { useFormContext } from "react-hook-form";

import { isBefore, isEqual, isValid } from "date-fns";

import Toast from "@/services/Toast";

import Dialog from "@/components/structures/FastCharge/Dialog";
import Box from "@/components/ui/Box";
import Button from "@/components/ui/Button";

import useFormatAndAddTime from "@/hooks/useFormatAndAddTime";

import { useFastChargeStore } from "@/store/useFastChargeStore";

function Submit() {
  const {
    isFormReady,
    setDialogState,
    setFormError,
    values: { startDate, startTime, finishDate, finishTime },
  } = useFastChargeStore((state) => state);

  const { setError, setFocus, clearErrors } = useFormContext();

  const formatStart = useFormatAndAddTime({
    date: startDate ?? "",
    time: startTime ?? "",
  });

  const formatEnd = useFormatAndAddTime({
    date: finishDate ?? "",
    time: finishTime ?? "",
  });

  function onSubmitAndCheckInputs() {
    if (isBefore(new Date(finishDate ?? ""), new Date(startDate ?? ""))) {
      setError("finish-date", {
        message: "Finish date must be after start date",
      });
      setFocus("finish-date");

      setFormError(true);

      Toast({
        type: "error",
        message: "Error",
        description: "An error occurred while creating the shift",
        duration: 1500,
      });

      return;
    }

    if (isEqual(new Date(formatEnd), new Date(formatStart))) {
      setError("finish-time", {
        message: "Finish time must be after start time",
      });
      setFocus("finish-time");

      setFormError(true);

      Toast({
        type: "error",
        message: "Error",
        description: "An error occurred while creating the shift",
        duration: 1500,
      });

      return;
    }

    if (isBefore(new Date(formatEnd ?? ""), new Date(formatStart ?? ""))) {
      setError("finish-time", {
        message: "Finish date must be after start date",
      });
      setFocus("finish-time");

      setFormError(true);

      Toast({
        type: "error",
        message: "Error",
        description: "An error occurred while creating the shift",
        duration: 1500,
      });

      return;
    }

    if (!isValid(new Date(formatEnd))) {
      setError("finish-date", {
        message: "Finish date is invalid",
      });

      setError("finish-time", {
        message: "Invalid time",
      });

      setFormError(true);

      Toast({
        type: "error",
        message: "Error",
        description: "An error occurred while creating the shift",
        duration: 1500,
      });

      return;
    }

    setDialogState(true);
    setFormError(false);
    clearErrors();
  }

  return (
    <Dialog>
      <Box classes="ml-auto w-fit">
        <Button
          type="button"
          variant="gradient_secondary"
          disabled={!isFormReady}
          onClick={() => onSubmitAndCheckInputs()}
        >
          Next
        </Button>
      </Box>
    </Dialog>
  );
}

export default Submit;
