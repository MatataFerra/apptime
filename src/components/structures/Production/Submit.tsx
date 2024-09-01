"use client";

import { useFormContext } from "react-hook-form";

import { isBefore } from "date-fns";

import Dialog from "@/components/structures/Production/Dialog";
import Box from "@/components/ui/Box";
import Button from "@/components/ui/Button";

import { useProductionForm } from "@/store/useProductionForm";

function Submit() {
  const {
    isFormReady,
    setDialogState,
    setFormError,
    values: { name },
  } = useProductionForm((state) => state);
  const { setError, setFocus, watch, clearErrors } = useFormContext();
  const startDateWatch = watch("start-date");
  const finishDateWatch = watch("finish-date");

  function onOpenDialogAndCheckInputs() {
    if (isBefore(new Date(finishDateWatch), new Date(startDateWatch))) {
      setDialogState(false);
      setError("finish-date", {
        message: "Finish date must be after start date",
      });

      setFocus("finish-date");

      setFormError(true);

      return;
    }

    const regexNameHasWhiteSpacesAtStart = /^\s+/;

    // check if name field has white spaces at the beginning
    if (name && regexNameHasWhiteSpacesAtStart.test(name)) {
      setError("name", {
        message: "Your title is not valid",
      });
      setFocus("name");

      setFormError(true);

      return;
    }

    clearErrors();
    setDialogState(true);
    setFormError(false);
  }

  return (
    <Dialog>
      <Box classes="ml-auto w-fit">
        <Button
          type="button"
          variant="gradient_secondary"
          disabled={!isFormReady}
          onClick={() => onOpenDialogAndCheckInputs()}
        >
          Next
        </Button>
      </Box>
    </Dialog>
  );
}

export default Submit;
