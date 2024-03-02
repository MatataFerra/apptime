import type { BG_TAILWIND_COLOR, FROM_TO_TAILWIND_COLOR } from "@/types/tailwind";

export type Gradient = {
  from: FROM_TO_TAILWIND_COLOR["from"];
  to?: FROM_TO_TAILWIND_COLOR["to"];
};

export type PlainColor = BG_TAILWIND_COLOR;

export type Color = PlainColor | Gradient;

export function isGradient(color: PlainColor | Gradient): color is Gradient {
  return (color as Gradient).from !== undefined;
}
