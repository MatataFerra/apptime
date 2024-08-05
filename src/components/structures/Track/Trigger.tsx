import { DialogTrigger } from "@/components/ui/Dialog";

import { BUTTON_VARIANTS } from "@/utils/constants/tailwind";
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
  const checkVariant = /Start/.test(triggerText);

  return (
    <>
      <DialogTrigger
        className={cn(
          "rounded-lg text-center",
          `remove_button_highlight w-full cursor-pointer shadow-button ${
            status?.apply_variant ? "active:shadow-button-inner" : ""
          }`,
          `${
            status?.apply_variant
              ? checkVariant
                ? BUTTON_VARIANTS.black
                : BUTTON_VARIANTS.danger
              : BUTTON_VARIANTS.disabled
          }`,
          `${triggerText.toLowerCase().includes("start") ? "animate-fade-up transition-all" : ""}`
        )}
        disabled={status?.disabled}
        aria-disabled={status?.disabled}
      >
        {triggerText}
      </DialogTrigger>
    </>
  );
}

export default Trigger;
