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
};

function Trigger({ status }: Props) {
  return (
    <>
      <DialogTrigger
        className={cn(
          "rounded-lg text-center",
          `remove_button_highlight w-full cursor-pointer shadow-button ${
            status?.apply_variant ? "active:shadow-button-inner" : ""
          }`,
          `${status?.apply_variant ? BUTTON_VARIANTS.black : BUTTON_VARIANTS.disabled}`
        )}
        disabled={status?.disabled}
        aria-disabled={status?.disabled}
      >
        Start Shift
      </DialogTrigger>
    </>
  );
}

export default Trigger;
