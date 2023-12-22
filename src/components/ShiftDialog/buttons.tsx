"use client";

import { Shift } from "@prisma/client";
import { useMutation } from "@tanstack/react-query";

import api from "@/services/Api/Shift";

import Button from "@/components/ui/Button";
import Stack from "@/components/ui/Stack";
import Text from "@/components/ui/Text";

import { DialogClose } from "../ui/Dialog";
import { useShiftStateContext } from "@/store/useShiftStatusStore";

type SuccessShiftResponse = {
  message: string;
  response: boolean;
  shift: Shift;
};

function checkData(data: unknown): data is SuccessShiftResponse {
  return typeof data === "object" && data !== null;
}

function DialogButtons() {
  const { user, updateShiftsInfo, updateShiftStatus, createShift, updateShiftUnclosed } =
    useShiftStateContext((state) => state);
  const mutate = useMutation({
    mutationFn: api.createShift.bind(api),
    onSuccess: (data) => {
      if (checkData(data)) {
        createShift({
          ...data.shift,
          id: data?.shift.id,
        });
        updateShiftsInfo();
        updateShiftUnclosed();
      }
    },
  });

  function onStartShift(publicHolidayWorked: boolean) {
    /* 
      1. se crea un nuevo shift
      
      2. se actualiza el usuario con el nuevo shift
      3. se actualiza el estado de los botones
      4. cambia de offline a online
      5. Cambia el estado del  shift de No Shift tracked a mostrar cuanto tiempo va
    */
    mutate.mutate({
      body: {
        userId: user?.id as string,
        startDate: new Date().toString(),
        isClosed: false,
        amount: 0,
        endDate: null,
        isPublicHoliday: false,
        notes: "",
        publicHolidayWorked,
      },
    });

    updateShiftStatus(false);
  }

  function onSelectOption(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    onStartShift(!!Number(e.currentTarget.dataset.button));
  }

  return (
    <>
      <Stack>
        <DialogClose asChild>
          <Button
            data-button={1}
            type="button"
            variant="gradient"
            classes="h-12 w-full px-[5px] py-[3px]"
            onClick={onSelectOption}
          >
            <Text
              as="span"
              classes="flex h-full w-full items-center justify-center rounded bg-white p-2 text-xs text-black"
            >
              Yes! Money 🤑
            </Text>
          </Button>
        </DialogClose>
        <DialogClose asChild>
          <Button
            type="button"
            variant="black"
            classes="h-12 w-full text-xs"
            onClick={onSelectOption}
            data-button={0}
          >
            No, regular day
          </Button>
        </DialogClose>
      </Stack>
    </>
  );
}

export default DialogButtons;
