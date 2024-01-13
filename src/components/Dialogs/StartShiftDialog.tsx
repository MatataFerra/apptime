import DialogButtons from "@/components/ShiftDialog/start_buttons";
import Trigger from "@/components/ShiftDialog/trigger";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import Image from "@/components/ui/Image";
import Stack from "@/components/ui/Stack";
import Text from "@/components/ui/Text";

type Props = {
  triggerStatus:
    | {
        disabled: boolean;
        apply_variant: boolean;
      }
    | undefined;
};

function StartShiftDialog({ triggerStatus }: Props) {
  return (
    <>
      <Dialog>
        <Trigger status={triggerStatus} />

        <DialogContent className="min-h-[300px] w-10/12">
          <DialogHeader>
            <DialogTitle className="flex justify-center">
              <Stack orientation="vertical" alignItems="center" spacing={2}>
                <Image
                  alt="question-mark"
                  src="/assets/marks/question_mark.svg"
                  height={50}
                  width={50}
                />
                <Text classes="text-2xl font-bold">Are you working on a public holiday?</Text>
              </Stack>
            </DialogTitle>
          </DialogHeader>
          <DialogDescription asChild className="flex gap-8">
            <DialogButtons />
          </DialogDescription>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default StartShiftDialog;
