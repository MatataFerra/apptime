"use client";

import type { PropsWithChildren, ReactNode } from "react";

import type { Hourly, Production } from "@prisma/client";
import * as VisualyHidden from "@radix-ui/react-visually-hidden";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import api from "@/services/Api/Shift";
import Toast from "@/services/Toast";

import type { UserType } from "@/types";
import type { SuccessApiResponse } from "@/types/api_response";

import TableDialogEditShift from "@/components/structures/Dashboard/Table/Dialog/Edit";
import { useTaxesHandlerDelete } from "@/components/structures/Dashboard/Table/Dialog/store/taxesHandlerDelete";
import Button from "@/components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/Dialog";
import Stack from "@/components/ui/Stack";

import { USE_QUERY_KEYS } from "@/utils/constants/use-query";
import useDashboard from "@/hooks/useDashboard";

import { useTableStore } from "@/store/useTableStore";

type Props = PropsWithChildren<{
  title: string;
  shift: Hourly | Production;
  content: ReactNode;
  type: "hourly" | "production";
  delete: (id: number) => void;
  reset: () => void;
}>;

function TableDialog({
  title,
  content,
  shift,
  type,
  children,
  delete: deleteShift,
  reset: resetShifts,
}: Props) {
  const { setStep, step } = useTableStore((state) => state);
  const { user } = useDashboard();
  const { reset } = useTaxesHandlerDelete((state) => state);
  const queryClient = useQueryClient();
  const router = useRouter();

  const { mutate } = useMutation({
    mutationFn: (type === "hourly"
      ? api.deleteHourly.bind(api)
      : api.deleteProduction.bind(api)) as unknown as (data: {
      id: number;
    }) => Promise<SuccessApiResponse<UserType>>,

    onMutate: () => {
      Toast({
        type: "info",
        message: "Deleting shift...",
        duration: Infinity,
      });
    },

    onSuccess: () => {
      Toast({
        type: "success",
        message: "Shift deleted successfully!",
        duration: 2000,
      });
    },

    onError: () => {
      //! update({ shifts: user?.shifts });

      resetShifts();
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [USE_QUERY_KEYS.USER, user?.email] });
      queryClient.invalidateQueries({ queryKey: [USE_QUERY_KEYS.HOURLY] });
      router.refresh();
    },
  });

  return (
    <>
      <Dialog
        onOpenChange={(open) => {
          if (!open) {
            reset();
            setTimeout(() => {
              setStep("info");
            }, 100);
          }
        }}
      >
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent>
          {step === "info" ? (
            <>
              <DialogHeader>
                <DialogTitle className="py-2 text-left text-xl text-ink">{title}</DialogTitle>
                <DialogDescription>
                  <VisualyHidden.Root>
                    Take a quick view about your job, edit it if you need
                  </VisualyHidden.Root>
                </DialogDescription>
              </DialogHeader>
              {content}
              <DialogFooter>
                <Stack orientation="horizontal" spacing={4} justifyContent="end">
                  <Button
                    type="button"
                    size="sm"
                    variant="white"
                    classes="active:shadow-button-inner"
                    onClick={() => setStep("edit")}
                  >
                    Edit
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="danger"
                    onClick={() => {
                      deleteShift(shift.id);
                      mutate({ id: shift.id });
                    }}
                  >
                    Delete
                  </Button>
                </Stack>
              </DialogFooter>
            </>
          ) : (
            <>
              <DialogHeader className="text-left">
                <DialogTitle className="py-2">Edit shift</DialogTitle>
                <DialogDescription>You can edit the shift details here.</DialogDescription>
              </DialogHeader>
              <TableDialogEditShift shift={shift} user={user} />
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

export default TableDialog;
