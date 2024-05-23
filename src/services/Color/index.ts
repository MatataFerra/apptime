import chroma from "chroma-js";

import { Color, ColorWithGradientAndHex, Gradient, PlainColor } from "@/types";
import { twColors } from "@/types/tailwind";

class ColorService {
  isGradient(color: PlainColor | Gradient | `#${string}`): color is Gradient {
    return (color as Gradient).from !== undefined;
  }

  checkTypeColor(
    color: string | { from: string; to: string }
  ): color is { from: string; to: string } {
    return (color as { from: string; to: string }).from !== undefined;
  }

  getColor<T extends Color>(
    color: T,
    options: { hex: boolean } = { hex: false }
  ): ColorWithGradientAndHex<T> {
    if (this.isGradient(color)) {
      const from = {
        color: color.from.split("-")[1],
        shade: Number(color.from.split("-")[2]),
      };

      const to = {
        color: color.to.split("-")[1],
        shade: Number(color.to.split("-")[2]),
      };

      if (options.hex) {
        return {
          from: chroma(twColors[from.color][from.shade]).hex(),
          to: chroma(twColors[to.color][to.shade]).hex(),
        } as ColorWithGradientAndHex<T>;
      }
      return {
        from: color.from,
        to: color.to,
      } as ColorWithGradientAndHex<T>;
    }

    const colorName = color.split("-")[1];
    const shade = Number(color.split("-")[2]);

    if (options.hex) {
      return chroma(twColors[colorName][shade]).hex() as ColorWithGradientAndHex<T>;
    }

    return color as ColorWithGradientAndHex<T>;
  }
}

const colorService = new ColorService();

export default colorService;
