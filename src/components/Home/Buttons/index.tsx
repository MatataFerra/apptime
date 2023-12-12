"use client";

import { useMemo, useState } from "react";

import ShiftService from "@/services/Shift";

import Button from "@/components/ui/Button";
import Stack from "@/components/ui/Stack";

import { useShiftStateContext } from "@/store/useShiftStatusStore";

function HomeButtons() {
  const { user, updateShift } = useShiftStateContext((state) => state);
  const shiftUnclosed = ShiftService.findUnClosedShift(user?.shifts);
  const [userIsActive, setUserIsActive] = useState(!shiftUnclosed?.isClosed);
  const buttonStatus = useMemo(() => {
    if (!user?.formCompleted)
      return {
        startButton: {
          disabled: true,
          apply_variant: false,
        },
        finishButton: {
          disabled: true,
          apply_variant: false,
        },
      };

    if (user?.formCompleted) {
      if (userIsActive)
        return {
          startButton: {
            disabled: true,
            apply_variant: false,
          },
          finishButton: {
            disabled: false,
            apply_variant: true,
          },
        };

      if (!userIsActive)
        return {
          startButton: {
            disabled: false,
            apply_variant: true,
          },
          finishButton: {
            disabled: true,
            apply_variant: false,
          },
        };
    }
  }, [user?.formCompleted, userIsActive]);

  function onStartShift() {
    setUserIsActive(true);
  }

  function onFinishShift() {
    /*
    Cuando termina el turno:
      1. Se actualiza el shift y se lo cierra: endDate e isClosed cambian de estado
      2. El título de la home pasa de Online a Offline
      3. La información del último shift guardado se actualiza en ShiftInfo
      4. El botón se desactiva 
    */
    const closed = {
      endDate: new Date().toString(),
      isClosed: true,
    };

    const open = {
      endDate: null,
      isClosed: false,
    };

    updateShift({
      ...closed,
      id: 4,
    });

    // const response = api.updateShift(open, /*shiftUnclosed?.id*/ 4);
    setUserIsActive(false);
  }

  return (
    <Stack classes="h-full w-full" spacing={10} alignItems="center" justifyContent="between">
      <Button
        classes={`remove_button_highlight w-full shadow-button ${
          buttonStatus?.startButton.apply_variant ? "active:shadow-button-inner" : ""
        }`}
        variant={buttonStatus?.startButton.apply_variant ? "black" : "disabled"}
        disabled={buttonStatus?.startButton.disabled}
        onClick={onStartShift}
      >
        Start Shift
      </Button>
      <Button
        classes={`remove_button_highlight w-full shadow-button ${
          buttonStatus?.finishButton.apply_variant ? "active:shadow-button-inner" : ""
        }`}
        variant={buttonStatus?.finishButton.apply_variant ? "danger" : "disabled"}
        disabled={buttonStatus?.finishButton.disabled}
        onClick={onFinishShift}
      >
        Finish Shift
      </Button>
    </Stack>
  );
}

export default HomeButtons;
