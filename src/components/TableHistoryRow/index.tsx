"use client";

import { useCallback, useState } from "react";

import { Shift } from "@prisma/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";

import api from "@/services/Api/Shift";
import DateHumanizer from "@/services/Date";
import ShiftService from "@/services/Shift";

import { Locale, UserType } from "@/types";
import { SuccessApiResponse } from "@/types/api_response/index";

import Button from "@/components/ui/Button";
import Image from "@/components/ui/Image";
import Ripple from "@/components/ui/Ripple";
import TableElement from "@/components/ui/TableElement";

import { useDashboardContext } from "@/store/useDashboardStore";

function TableHistoryRow({ shift }: { shift: Shift }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
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
      router.refresh();
    },
  });

  function shortDate(date: string) {
    const short = new DateHumanizer("short").humanizeDate(new Date(date), {
      locale: locale,
    });

    return short;
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
        <Ripple>
          <Button
            variant="rounded"
            classes="size-10"
            onClick={() => {
              // Delete shift
              mutate({ id: shift.id });
            }}
          >
            <Image src="/assets/trash.svg" classes="z-20" alt="delete" width={20} height={20} />
          </Button>
        </Ripple>
      </TableElement>
    </TableElement>
  );
}

export default TableHistoryRow;
