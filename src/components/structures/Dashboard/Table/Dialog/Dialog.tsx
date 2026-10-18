"use client";

import { type PropsWithChildren, type ReactNode, useState } from "react";

import type { Hourly, Production } from "@prisma/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
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
  const [confirmDelete, setConfirmDelete] = useState(false);
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
            setConfirmDelete(false);
            setTimeout(() => {
              setStep("info");
            }, 100);
          }
        }}
      >
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent className="max-h-[90dvh] gap-5 overflow-y-auto p-5">
          {step === "info" ? (
            <>
              <DialogHeader className="text-left">
                <DialogTitle>{shift.name || title}</DialogTitle>
                <DialogDescription>
                  {format(new Date(shift.startDate), "EEEE d MMMM yyyy")}
                </DialogDescription>
              </DialogHeader>
              {content}
              <DialogFooter className="grid grid-cols-2 gap-2.5 sm:space-x-0">
                {confirmDelete ? (
                  <>
                    <Button
                      type="button"
                      size="lg"
                      variant="outline"
                      classes="w-full"
                      onClick={() => setConfirmDelete(false)}
                    >
                      Keep it
                    </Button>
                    <Button
                      type="button"
                      size="lg"
                      variant="danger"
                      classes="w-full"
                      onClick={() => {
                        deleteShift(shift.id);
                        mutate({ id: shift.id });
                      }}
                    >
                      Delete shift
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      type="button"
                      size="lg"
                      variant="ghost"
                      classes="w-full text-destructive"
                      onClick={() => setConfirmDelete(true)}
                    >
                      Delete
                    </Button>
                    <Button
                      type="button"
                      size="lg"
                      variant="primary"
                      classes="w-full"
                      onClick={() => setStep("edit")}
                    >
                      Edit
                    </Button>
                  </>
                )}
              </DialogFooter>
            </>
          ) : (
            <>
              <DialogHeader className="text-left">
                <DialogTitle>Edit shift</DialogTitle>
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
