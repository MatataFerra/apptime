"use client";

import { TAILWIND_COLOR } from "@/types/tailwind";

import { cn } from "@/utils/helpers/styleMerger";

type Props = {
  color?: TAILWIND_COLOR;
  classes?: string;
};

function Line({ color = "bg-stone-500", classes }: Props) {
  return <div className={cn("flex h-px w-full", `${color}`, classes)} />;
}

export default Line;
