"use client";

import { useCallback, useState } from "react";

import { Shift } from "@prisma/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocale } from "next-intl";

import api from "@/services/Api/Shift";
import DateHumanizer from "@/services/Date";
import ShiftService from "@/services/Shift";

import { Locale, UserType } from "@/types";

import Button from "@/components/ui/Button";
import Image from "@/components/ui/Image";
import TableElement from "@/components/ui/TableElement";

import { SuccessApiResponse } from "../../types/api_response/index";
import { useDashboardContext } from "@/store/useDashboardStore";

function TableHistoryRow({ shift }: { shift: Shift }) {
  const [isRippled, setIsRippled] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const locale = useLocale() as Locale;
  const queryClient = useQueryClient();
  const { user, update, deleteShift } = useDashboardContext((state) => state);

  const calculateEarnings = useCallback(
    (shift: Shift) => {
      return ShiftService.calculateEarnings({
        profile: user?.profile ?? null,
        shift,
      });
    },
    [user]
  );

  const { mutate } = useMutation({
    mutationFn: api.deleteShift.bind(api) as unknown as ({
      id,
    }: {
      id: number;
    }) => Promise<SuccessApiResponse<UserType>>,
    onMutate: async ({ id }) => {
      setTimeout(() => {
        setIsDeleting(true);
      }, 750);

      setTimeout(() => {
        deleteShift(id);
      }, 1500);
    },

    onError: () => {
      update({ shifts: user?.shifts });
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });

  function shortDate(date: string) {
    return new DateHumanizer("short").humanizeDate(new Date(date), {
      locale: locale,
    });
  }

  function getHours(minutes: number) {
    return ShiftService.convertAmountInDecimal(minutes);
  }

  return (
    <TableElement as="tr" classes={isDeleting ? "animate-fade-out-left" : undefined}>
      <TableElement>{shortDate(shift.startDate)}</TableElement>
      <TableElement>{shift?.amount ? String(getHours(shift?.amount ?? 0)) : "..."}</TableElement>
      <TableElement>${String(calculateEarnings(shift))}</TableElement>
      <TableElement>
        <Button
          variant="rippled"
          classes={isRippled ? "after:animate-ripple" : ""}
          onClick={() => {
            // Delete shift
            mutate({ id: shift.id });

            setIsRippled(true);

            setTimeout(() => {
              setIsRippled(false);
            }, 500);
          }}
        >
          <Image
            src="/assets/trash.svg"
            classes="relative z-20"
            alt="delete"
            width={20}
            height={20}
          />
        </Button>
      </TableElement>
    </TableElement>
  );
}

export default TableHistoryRow;
