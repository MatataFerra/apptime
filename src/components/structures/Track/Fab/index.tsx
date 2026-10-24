"use client";

import { forwardRef } from "react";

import { Receipt, StickyNote } from "lucide-react";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";

import { buttonVariants } from "@/components/ui/Button";

import { cn } from "@/utils/helpers/styleMerger";
import useTrack from "@/hooks/useTrack";

const TaxDialog = dynamic(() => import("@/components/structures/Track/Tax"), {
  ssr: false,
});

const Notes = dynamic(() => import("@/components/modules/Notes/Notes"), {
  ssr: false,
});

const ToolButton = forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { icon: React.ReactNode }
>(function ToolButton({ icon, children, className, ...props }, ref) {
  return (
    <button
      ref={ref}
      type="button"
      className={cn(
        buttonVariants({ variant: "outline", size: "lg" }),
        "h-13 w-full rounded-2xl text-[0.9375rem] font-semibold",
        className
      )}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
});

/**
 * Notes and taxes for the running shift, as two plain buttons under the
 * monitor (they used to hide behind a floating + menu).
 */
function ShiftTools() {
  const { isShiftActive, isClosing } = useTrack();
  const t = useTranslations("track.tools");

  if (!isShiftActive || isClosing) return null;

  return (
    <div className="grid w-full grid-cols-2 gap-2.5">
      <Notes>
        <ToolButton
          icon={<StickyNote className="size-4.5" strokeWidth={1.75} aria-hidden="true" />}
        >
          {t("notes")}
        </ToolButton>
      </Notes>
      <TaxDialog>
        <ToolButton icon={<Receipt className="size-4.5" strokeWidth={1.75} aria-hidden="true" />}>
          {t("taxes")}
        </ToolButton>
      </TaxDialog>
    </div>
  );
}

export default ShiftTools;
