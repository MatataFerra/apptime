import type { PropsWithChildren } from "react";

import Stack from "@/components/ui/Stack";

import { cn } from "@/utils/helpers/styleMerger";

type Props = {
  content: string;
  classes?: string;
};

function DialogValue({ content, classes, children }: PropsWithChildren<Props>) {
  return (
    <Stack
      as="div"
      data-content={content}
      orientation="vertical"
      classes={cn(
        "relative w-full rounded-md px-2 py-3 shadow-md ring-1 ring-stone-500/40 after:absolute after:-top-2 after:rounded-md after:bg-white after:px-1 after:py-[0.1px] after:text-xs after:text-stone-500 after:shadow-md after:ring-1 after:ring-stone-500/40 after:content-[attr(data-content)]",
        classes
      )}
    >
      {children}
    </Stack>
  );
}

export default DialogValue;
