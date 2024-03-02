import Stack from "@/components/ui/Stack";

import { type Color, isGradient } from "@/utils/helpers/colorOrGradient";
import { cn } from "@/utils/helpers/styleMerger";

type Props = {
  legend: string;
  color: Color;
};

function ChartLegend({ legend, color }: Props) {
  const gradient = isGradient(color);

  return (
    <Stack orientation="horizontal" spacing={8} alignItems="center">
      <Stack orientation="horizontal" alignItems="center">
        <div
          className={cn(
            "size-4 rounded-full",
            gradient ? `bg-gradient-to-r ${color.from} ${color.to}` : color
          )}
        />
        <span>{legend}</span>
      </Stack>
    </Stack>
  );
}

export default ChartLegend;
