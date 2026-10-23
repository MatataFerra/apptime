"use client";

import { useFormContext } from "react-hook-form";

import { isBefore, isEqual, isValid } from "date-fns";
import { useTranslations } from "next-intl";

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
    values: { startDate, startTime, finishDate, finishTime, name },
  } = useFastChargeStore((state) => state);

  const { setError, setFocus, clearErrors } = useFormContext();
  const t = useTranslations("shift");

  function errorToast() {
    Toast({
      type: "error",
      message: t("check_dates"),
      description: t("check_dates_description"),
      duration: 1500,
    });
  }

  const formatStart = useFormatAndAddTime({
    date: startDate ?? "",
    time: startTime ?? "",
  });

  const formatEnd = useFormatAndAddTime({
    date: finishDate ?? "",
    time: finishTime ?? "",
  });

  function onSubmitAndCheckInputs() {
    // check if finish date is before than start date
    if (isBefore(new Date(finishDate ?? ""), new Date(startDate ?? ""))) {
      setError("finish-date", {
        message: t("errors.finish_before_start"),
      });
      setFocus("finish-date");

      setFormError(true);

      errorToast();

      return;
    }

    // check if both dates are same
    if (isEqual(new Date(formatEnd), new Date(formatStart))) {
      setError("finish-time", {
        message: t("errors.finish_time_before_start"),
      });
      setFocus("finish-time");

      setFormError(true);

      errorToast();

      return;
    }

    // check if finish date is before than start date
    if (isBefore(new Date(formatEnd ?? ""), new Date(formatStart ?? ""))) {
      setError("finish-time", {
        message: t("errors.finish_before_start"),
      });
      setFocus("finish-time");

      setFormError(true);

      errorToast();

      return;
    }

    // check if date is valid date
    if (!isValid(new Date(formatEnd))) {
      setError("finish-date", {
        message: t("errors.finish_invalid"),
      });

      setError("finish-time", {
        message: t("errors.time_invalid"),
      });

      setFormError(true);

      errorToast();

      return;
    }

    const regexNameHasWhiteSpacesAtStart = /^\s+/;

    // check if name field has white spaces at the beginning
    if (name && regexNameHasWhiteSpacesAtStart.test(name)) {
      setError("name", {
        message: t("errors.name_invalid"),
      });
      setFocus("name");

      setFormError(true);

      return;
    }

    setDialogState(true);
    setFormError(false);
    clearErrors();
  }

  return (
    <Dialog>
      <Box classes="w-full">
        <Button
          type="button"
          variant="primary"
          classes="h-14 w-full rounded-2xl text-base font-semibold"
          disabled={!isFormReady}
          onClick={() => onSubmitAndCheckInputs()}
        >
          {t("review_button")}
        </Button>
      </Box>
    </Dialog>
  );
}

export default Submit;
