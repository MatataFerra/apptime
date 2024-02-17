"use client";

import { useCallback, useEffect, useState } from "react";

import { Shift } from "@prisma/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocale } from "next-intl";

import api from "@/services/Api/Shift";
import DateHumanizer from "@/services/Date";
import ShiftService from "@/services/Shift";

import { Locale, UserType } from "@/types";

import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icons";
import Image from "@/components/ui/Image";
import Text from "@/components/ui/Text";

import { cn } from "@/utils/helpers/styleMerger";

import { SuccessApiResponse } from "../../types/api_response/index";
import { useDashboardContext } from "@/store/useDashboardStore";

function TableElement({ shift }: { shift: Shift }) {
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
    <tr
      className={`border border-l-0 border-r-0 border-t-0 border-b-slate-400 ${isDeleting ? "animate-fade-out-left" : ""}`}
    >
      <Text as="td" classes="py-3">
        {shortDate(shift.startDate)}
      </Text>
      <Text as="td" classes="py-3">
        {shift?.amount ? String(getHours(shift?.amount ?? 0)) : "..."}
      </Text>
      <Text as="td" classes="py-3">
        ${String(calculateEarnings(shift))}
      </Text>
      <td>
        <Button
          variant="outlined"
          classes={`relative z-0 size-10 rounded-full bg-transparent after:absolute after:inset-0  after:rounded-full after:bg-light-blue after:opacity-0 ${isRippled ? "after:animate-ripple" : ""}`}
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
      </td>
    </tr>
  );
}

export default TableElement;
