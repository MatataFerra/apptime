import { useTranslations } from "next-intl";

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
};

/** Opens the start-shift dialog. */
function Trigger({ status }: Props) {
  const t = useTranslations("track.start");
  const variant = status?.apply_variant ? "accent" : "secondary";

  return (
    <DialogTrigger
      className={cn(
        buttonVariants({ variant, size: "lg" }),
        "remove_button_highlight h-14 w-full animate-fade-up rounded-lg text-base font-semibold"
      )}
      disabled={status?.disabled}
      aria-disabled={status?.disabled}
    >
      {t("trigger")}
    </DialogTrigger>
  );
}

export default Trigger;
