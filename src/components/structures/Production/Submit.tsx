"use client";

import { useFormContext, useWatch } from "react-hook-form";

import { isBefore } from "date-fns";
import { useTranslations } from "next-intl";

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
  const { setError, setFocus, control, clearErrors } = useFormContext();
  const t = useTranslations("shift");
  // useWatch, not watch(): the React Compiler would memoize watch() and freeze the value.
  const startDateWatch = useWatch({ control, name: "start-date" });
  const finishDateWatch = useWatch({ control, name: "finish-date" });

  function onOpenDialogAndCheckInputs() {
    if (isBefore(new Date(finishDateWatch), new Date(startDateWatch))) {
      setDialogState(false);
      setError("finish-date", {
        message: t("errors.finish_before_start"),
      });

      setFocus("finish-date");

      setFormError(true);

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

    clearErrors();
    setDialogState(true);
    setFormError(false);
  }

  return (
    <Dialog>
      <Box classes="w-full">
        <Button
          type="button"
          variant="primary"
          classes="h-14 w-full rounded-2xl text-base font-semibold"
          disabled={!isFormReady}
          onClick={() => onOpenDialogAndCheckInputs()}
        >
          {t("review_button")}
        </Button>
      </Box>
    </Dialog>
  );
}

export default Submit;
