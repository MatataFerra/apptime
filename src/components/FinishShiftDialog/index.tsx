"use client";

import FinishDialogButtons from "@/components/ShiftDialog/finish_buttons";
import FinishDescription from "@/components/ShiftDialog/finish_description";
import Trigger from "@/components/ShiftDialog/trigger";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import Image from "@/components/ui/Image";
import Stack from "@/components/ui/Stack";
import Text from "@/components/ui/Text";

import { useShiftStateContext } from "@/store/useShiftStatusStore";

type Props = {
  triggerStatus:
    | {
        disabled: boolean;
        apply_variant: boolean;
      }
    | undefined;
};

/**
 * @deprecated This component is deprecated and should be replaced with the new ShiftFinishButton component
 */

function FinishShiftDialog({ triggerStatus }: Props) {
  const { updateInputsAreDisabled, setButtonClicked } = useShiftStateContext((state) => state);

  return (
    <>
      <Dialog
        onOpenChange={(open) => {
          if (!open) {
            setTimeout(() => updateInputsAreDisabled(true), 100);
            setButtonClicked({
              edit: true,
              moveOn: true,
              cancel: false,
              ok: false,
            });

            return;
          }
        }}
      >
        <Trigger status={triggerStatus} triggerText="Finish Shift" />

        <DialogContent className="min-h-[300px] w-10/12">
          <DialogHeader>
            <DialogTitle className="flex justify-center">
              <Stack orientation="horizontal" spacing={6}>
                <Image
                  alt="warning-mark"
                  src="/assets/marks/warning_mark.svg"
                  height={50}
                  width={50}
                />
                <Text classes="text-left text-2xl font-normal">
                  Do you want charge a shift with this time?
                </Text>
              </Stack>
            </DialogTitle>
          </DialogHeader>
          <FinishDescription />
          <DialogFooter className="flex gap-8">
            <FinishDialogButtons />
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default FinishShiftDialog;
