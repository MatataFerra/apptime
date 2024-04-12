"use client";

import { PropsWithChildren } from "react";

import { Shift } from "@prisma/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import api from "@/services/Api/Shift";
import Toast from "@/services/Toast";

import { UserType } from "@/types";
import { SuccessApiResponse } from "@/types/api_response";

import Button from "@/components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/Dialog";
import Stack from "@/components/ui/Stack";

import { useDashboardContext } from "@/store/useDashboardStore";

type Props = PropsWithChildren<{
  title: string;
  shift: Shift;
  content: React.ReactNode;
}>;

function TableDialog({ title, content, shift, children }: Props) {
  const { user, update, deleteShift } = useDashboardContext((state) => state);
  const queryClient = useQueryClient();
  const router = useRouter();
  const { mutate } = useMutation({
    mutationFn: api.deleteShift.bind(api) as unknown as ({
      id,
    }: {
      id: number;
    }) => Promise<SuccessApiResponse<UserType>>,

    onMutate: async () => {
      Toast({
        type: "info",
        message: "Deleting shift...",
        duration: 2000,
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
      update({ shifts: user?.shifts });
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
      router.refresh();
    },
  });
  return (
    <>
      <Dialog>
        <DialogTrigger asChild>{children}</DialogTrigger>

        <DialogContent>
          <DialogHeader>
            <DialogTitle className="border-b border-gray-800 py-2">{title}</DialogTitle>
          </DialogHeader>
          {content}
          <DialogFooter>
            <Stack orientation="horizontal" spacing={4} justifyContent="end">
              <Button type="button" size="sm" variant="white" classes="active:shadow-button-inner">
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
        </DialogContent>
      </Dialog>
    </>
  );
}

export default TableDialog;
