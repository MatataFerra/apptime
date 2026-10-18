import { buttonVariants } from "@/components/ui/Button";
import { DialogTrigger } from "@/components/ui/Dialog";

import { cn } from "@/utils/helpers/styleMerger";

type Props = {
  status:
    | {
        disabled: boolean;
        apply_variant: boolean;
      }
    | undefined;
  triggerText?: string;
};

function Trigger({ status, triggerText = "Start Shift" }: Props) {
  const isStart = /start/i.test(triggerText);
  const variant = status?.apply_variant ? (isStart ? "accent" : "danger") : "secondary";

  return (
    <DialogTrigger
      className={cn(
        buttonVariants({ variant, size: "lg" }),
        "remove_button_highlight h-14 w-full rounded-lg text-base font-semibold",
        isStart && "animate-fade-up"
      )}
      disabled={status?.disabled}
      aria-disabled={status?.disabled}
    >
      {triggerText}
    </DialogTrigger>
  );
}

export default Trigger;
