"use client";

import { useState } from "react";

import { useMutation } from "@tanstack/react-query";

import api from "@/services/Api/Shift";
import ShiftService from "@/services/Shift";

import Button from "@/components/ui/Button";
import Stack from "@/components/ui/Stack";

import useButtonStatus from "@/hooks/useButtonStatus";

import { useShiftStateContext } from "@/store/useShiftStatusStore";

function HomeButtons() {
  const { user, updateShift, updateShiftsInfo } = useShiftStateContext((state) => state);
  const shiftUnclosed = ShiftService.findUnClosedShift(user?.shifts);
  const [shiftIsActive, setShiftIsActive] = useState(shiftUnclosed?.isClosed);
  const buttonStatus = useButtonStatus(user, shiftIsActive);
  const mutateShiftEnd = useMutation({
    mutationFn: api.updateShift.bind(api),
    onSuccess: (_) => {
      updateShiftsInfo();
    },
  });

  function onStartShift() {
    /* 
      1. se crea un nuevo shift
      2. se actualiza el usuario con el nuevo shift
      3. se actualiza el estado de los botones
      4. cambia de offline a online
      5. Cambia el estado del  shift de No Shift tracked a mostrar cuanto tiempo va
    */
    setShiftIsActive(true);
  }

  function onFinishShift() {
    updateShift({
      isClosed: true,
      endDate: new Date().toString(),
      id: shiftUnclosed?.id,
    });

    mutateShiftEnd.mutate({
      body: {
        ...shiftUnclosed,
      },
      id: shiftUnclosed?.id,
    });
    setShiftIsActive(false);
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
