import { isValidElement } from "react";

import colorService from "@/services/Color";

import Stack from "@/components/ui/Stack";

import { cn } from "@/utils/helpers/styleMerger";

type Props = {
  legend?: string | React.ReactNode;
  color?: string | { from: string; to: string };
};

function ChartLegend({ legend, color }: Props) {
  return (
    <>
      {isValidElement(legend) ? (
        legend
      ) : (
        <Stack orientation="horizontal" spacing={8} alignItems="center">
          <Stack orientation="horizontal" alignItems="center">
            <div
              className={cn(
                "size-4 rounded-full",
                color
                  ? colorService.checkTypeColor(color)
                    ? `bg-linear-to-r ${color?.from} ${color?.to}`
                    : color
                  : null
              )}
            />
            <span>{legend}</span>
          </Stack>
        </Stack>
      )}
    </>
  );
}

export default ChartLegend;
