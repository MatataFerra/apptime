"use client";

import { TAILWIND_COLOR } from "@/types/tailwind";

import { cn } from "@/utils/helpers/styleMerger";

type Props = {
  color?: TAILWIND_COLOR;
};

function Line({ color = "bg-stone-500" }: Props) {
  return <div className={cn("flex h-[1px] w-full", `${color}`)} />;
}

export default Line;
