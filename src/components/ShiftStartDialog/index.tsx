"use client";

import Trigger from "@/components/ShiftDialog/trigger";
import ShiftStartStepTwo from "@/components/ShiftStartStepTwo";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";

type Props = {
  triggerStatus:
    | {
        disabled: boolean;
        apply_variant: boolean;
      }
    | undefined;
};

function ShiftStartDialog({ triggerStatus }: Props) {
  return (
    <>
      <Dialog>
        <Trigger status={triggerStatus} />
        <DialogContent className="min-h-[300px] w-10/12">
          <DialogHeader className="text-left">
            <DialogTitle>Set shift before start</DialogTitle>
            <DialogDescription>
              Please fill in the following details to start your shift
            </DialogDescription>
          </DialogHeader>
          <ShiftStartStepTwo />
        </DialogContent>
      </Dialog>
    </>
  );
}

export default ShiftStartDialog;
